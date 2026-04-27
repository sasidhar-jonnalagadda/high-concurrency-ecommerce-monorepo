import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { acquireLock, releaseLock } from '../utils/redis-lock';
import {
  InsufficientStockError,
  ResourceNotFoundError,
  LockAcquisitionError,
  ConcurrencyConflictError
} from '../utils/errors';

interface CheckoutItem {
  productId: string;
  qty: number;
}

/**
 * Reserves inventory for a list of items using a "Sort-then-Lock" strategy 
 * to prevent database deadlocks and a Redis distributed lock to handle 
 * cross-instance concurrency. Additionally implements Optimistic Concurrency 
 * Control (OCC) as a strict fallback.
 */
export async function reserveInventory(items: CheckoutItem[]): Promise<void> {
  // 1. Sort-then-Lock Pattern: Lexicographical sorting to prevent deadlocks
  const sortedItems = [...items].sort((a, b) =>
    a.productId.localeCompare(b.productId)
  );

  const locks: { key: string; lockId: string }[] = [];

  try {
    // 2. Distributed Locking Phase
    for (const item of sortedItems) {
      const lockKey = `lock:product:${item.productId}`;
      const lockId = await acquireLock(lockKey, 5000, 5);

      if (!lockId) {
        throw new LockAcquisitionError(`product ${item.productId}`);
      }

      locks.push({ key: lockKey, lockId });
    }

    // 3. Database Transaction Phase with OCC
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of sortedItems) {
        // Fetch current version for OCC
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { countInStock: true, name: true, version: true },
        });

        if (!product) {
          throw new ResourceNotFoundError('Product', item.productId);
        }

        if (product.countInStock < item.qty) {
          throw new InsufficientStockError(product.name, item.qty, product.countInStock);
        }

        try {
          // 4. Optimistic Concurrency Control Check
          // We include the version in the WHERE clause. If another process updated it,
          // the update will fail (count will be 0), triggering a P2025 error in Prisma.
          await tx.product.update({
            where: { 
              id: item.productId,
              version: product.version // Strict OCC Check
            },
            data: { 
              countInStock: { decrement: item.qty },
              version: { increment: 1 } // Increment version on every update
            },
          });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new ConcurrencyConflictError(product.name);
          }
          throw error;
        }
      }
    });
  } finally {
    // 5. Cleanup: Always release locks
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
