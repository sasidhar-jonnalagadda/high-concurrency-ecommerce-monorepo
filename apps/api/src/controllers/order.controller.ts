import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { OrderStatus, UserRole } from '@ecommerce/shared';
import { ForbiddenError, ResourceNotFoundError, BadRequestError } from '../utils/errors';
import { stripe } from '../config/stripe';

export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, image: true, slug: true } },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { name: true, image: true, slug: true } },
          },
        },
        shippingAddress: true,
        paymentResult: true,
      },
    });

    if (!order) {
      throw new ResourceNotFoundError('Order', id);
    }

    if (order.userId !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderToDelivered = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new ResourceNotFoundError('Order', id);
    }

    const validDeliveryStates = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED];
    if (!validDeliveryStates.includes(order.status as OrderStatus)) {
      throw new BadRequestError(`Cannot deliver an order with current status: ${order.status}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = 20;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pageSize * (page - 1),
        take: pageSize,
      }),
      prisma.order.count(),
    ]);

    res.json({
      data: orders,
      page,
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new ResourceNotFoundError('Order', id);
    }

    // Automated Refund Logic: If status is set to CANCELLED and it was already PAID
    if (status === OrderStatus.CANCELLED && order.status === OrderStatus.PAID && order.stripePaymentIntentId) {
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        reason: 'requested_by_customer',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        deliveredAt: status === OrderStatus.DELIVERED ? new Date() : order.deliveredAt,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
