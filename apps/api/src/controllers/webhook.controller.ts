import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/db';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { restoreInventory } from '../services/inventory.service';
import { OrderStatus } from '@ecommerce/shared';

export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) {
    res.status(400).json({ message: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    res.status(400).json({ message: `Webhook Error: ${message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadataOrderId = session.metadata?.orderId;

        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: metadataOrderId },
              { stripeSessionId: session.id }
            ]
          },
        });

        if (!order) {
          console.error(`Order not found for session ${session.id} (metadata.orderId: ${metadataOrderId})`);
          break;
        }

        if (order.status !== OrderStatus.PENDING) {
          break;
        }

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.PAID,
              paidAt: new Date(),
              stripePaymentIntentId: session.payment_intent as string,
              paymentResult: {
                create: {
                  transactionId: (session.payment_intent as string) || session.id,
                  status: session.payment_status || 'paid',
                  updateTime: new Date(),
                  emailAddress: session.customer_details?.email || '',
                },
              },
            },
          });
        });

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadataOrderId = session.metadata?.orderId;

        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: metadataOrderId },
              { stripeSessionId: session.id }
            ]
          },
        });

        if (!order || order.status !== OrderStatus.PENDING) {
          break;
        }

        await restoreInventory(order.id);
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });

        break;
      }

      default:
        // No action needed for unhandled events
    }
  } catch (error) {
    console.error(`Critical failure processing Stripe webhook event (${event.type}):`, error);
  }

  res.json({ received: true });
};
