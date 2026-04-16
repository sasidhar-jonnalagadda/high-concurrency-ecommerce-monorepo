import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { acquireLock, releaseLock } from '../utils/redis-lock';
import {
  InsufficientStockError,
  ResourceNotFoundError,
  LockAcquisitionError
} from '../utils/errors';

interface CheckoutItem {
  productId: string;
  qty: number;
}

/**
 * Reserves inventory for a list of items using a "Sort-then-Lock" strategy 
 * to prevent database deadlocks and a Redis distributed lock to handle 
 * cross-instance concurrency.
 * 
 * @param items - List of products and quantities to reserve
 * @throws {LockAcquisitionError} If a product lock cannot be acquired
 * @throws {ResourceNotFoundError} If a product does not exist
 * @throws {InsufficientStockError} If inventory levels are too low
 */
export async function reserveInventory(items: CheckoutItem[]): Promise<void> {
  const sortedItems = [...items].sort((a, b) =>
    a.productId.localeCompare(b.productId)
  );

  const locks: { key: string; lockId: string }[] = [];

  try {
    for (const item of sortedItems) {
      const lockKey = `lock:product:${item.productId}`;
      const lockId = await acquireLock(lockKey, 5000, 5);

      if (!lockId) {
        throw new LockAcquisitionError(`product ${item.productId}`);
      }

      locks.push({ key: lockKey, lockId });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of sortedItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { countInStock: true, name: true },
        });

        if (!product) {
          throw new ResourceNotFoundError('Product', item.productId);
        }

        if (product.countInStock < item.qty) {
          throw new InsufficientStockError(product.name, item.qty, product.countInStock);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { countInStock: { decrement: item.qty } },
        });
      }
    });
  } finally {
    await Promise.all(
      locks.map(({ key, lockId }) => releaseLock(key, lockId))
    );
  }
}

/**
 * Restores inventory for an order (e.g., during cancellation or refund).
 * 
 * @param orderId - The unique identifier of the order to restore
 */
export async function restoreInventory(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) {
    console.warn(`Attempted to restore inventory for non-existent order: ${orderId}`);
    return;
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { countInStock: { increment: item.qty } },
      });
    }
  });

  // No log needed
}
