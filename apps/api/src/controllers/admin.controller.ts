import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { OrderStatus, UserRole } from '@ecommerce/shared';
import { BadRequestError } from '../utils/errors';

/**
 * Admin Controller
 * Handles specialized management operations and metrics for the dashboard.
 */

export const getAdminMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalProducts, totalOrders, activeOrdersCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING]
          }
        }
      })
    ]);

    const orders = await prisma.order.findMany({
      select: { totalPrice: true }
    });
    
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

    res.json({
      totalProducts,
      totalOrders,
      activeOrders: activeOrdersCount,
      totalSales
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestError('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        role: UserRole.ADMIN 
      },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(201).json({
      user,
      message: 'Admin account created successfully',
    });
  } catch (error) {
    next(error);
  }
};
