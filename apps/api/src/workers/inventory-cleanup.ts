import { prisma } from '../config/db';
import { restoreInventory } from '../services/inventory.service';
import { acquireLock, releaseLock } from '../utils/redis-lock';
import { OrderStatus } from '@ecommerce/shared';

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const STALE_ORDER_AGE_MINUTES = 60;
const WORKER_LOCK_KEY = 'worker:inventory-cleanup';
const WORKER_LOCK_TTL = 9 * 60 * 1000;

export function startInventoryCleanupWorker() {
  // Worker initialized

  setInterval(async () => {
    const lockId = await acquireLock(WORKER_LOCK_KEY, WORKER_LOCK_TTL, 1);
    if (!lockId) {
      return;
    }

    try {
      const staleDate = new Date(Date.now() - STALE_ORDER_AGE_MINUTES * 60 * 1000);

      const staleOrders = await prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          createdAt: {
            lt: staleDate,
          },
        },
        select: { id: true },
      });

      if (staleOrders.length === 0) {
        return;
      }

      // Cleanup processing

      for (const order of staleOrders) {
        try {
          const { count } = await prisma.order.updateMany({
            where: {
              id: order.id,
              status: OrderStatus.PENDING,
            },
            data: {
              status: OrderStatus.CANCELLED,
            },
          });

          if (count === 1) {
            await restoreInventory(order.id);
          }
        } catch (err) {
          console.error(`Failed to cleanup order ${order.id}:`, err);
        }
      }
    } catch (error) {
      console.error('Inventory cleanup worker encountered a fatal error:', error);
    } finally {
      await releaseLock(WORKER_LOCK_KEY, lockId);
    }
  }, CLEANUP_INTERVAL_MS);
}
