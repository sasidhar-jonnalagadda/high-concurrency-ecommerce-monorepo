import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { reserveInventory, restoreInventory } from '../services/inventory.service';
import { OrderStatus, PaymentMethod } from '@ecommerce/shared';
import { ResourceNotFoundError, BadRequestError } from '../utils/errors';

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let orderId: string | null = null;
  let inventoryReserved = false;

  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user!.id;

    await reserveInventory(items);
    inventoryReserved = true;

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItemsData = items.map((item: { productId: string; qty: number }) => {
      const product = productMap.get(item.productId);
      if (!product) throw new ResourceNotFoundError('Product', item.productId);

      return {
        productId: item.productId,
        qty: item.qty,
        price: product.price,
        name: product.name,
        image: product.image,
      };
    });

    const itemsPrice = orderItemsData.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.qty,
      0
    );

    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.shippingAddress.create({
        data: shippingAddress,
      });

      return await tx.order.create({
        data: {
          userId,
          shippingAddressId: address.id,
          paymentMethod: paymentMethod as PaymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItemsData.map((item: any) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
            })),
          },
        },
      });
    });

    orderId = order.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      client_reference_id: order.id,
      customer_email: req.user!.email,
      metadata: { orderId: order.id },
      line_items: orderItemsData.map((item: any) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.qty,
      })),
      success_url: `${env.FRONTEND_URL}/orders/${order.id}?success=true`,
      cancel_url: `${env.FRONTEND_URL}/cart?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.status(201).json({
      orderId: order.id,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (inventoryReserved) {
      try {
        if (orderId) {
          await restoreInventory(orderId);
          await prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.CANCELLED },
          });
        } else {
          const { items } = req.body;
          await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            for (const item of items) {
              await tx.product.update({
                where: { id: item.productId },
                data: { countInStock: { increment: item.qty } },
              });
            }
          });
        }
      } catch (rollbackError) {
        console.error('Critical Failure during inventory rollback:', rollbackError);
      }
    }
    next(error);
  }
};
