import { redis } from '../config/redis';
import crypto from 'crypto';

/**
 * Attempts to acquire a distributed lock using Redis.
 * Implements a "Redlock-lite" pattern using SET NX PX and LUA scripts for atomicity.
 * 
 * @param key - The unique resource key to lock (e.g., 'lock:product:123')
 * @param ttlMs - Time-to-live in milliseconds (default: 5000)
 * @param retries - Number of retry attempts if lock is already held (default: 3)
 * @returns A unique lock value (UUID) if successful, or null if failed
 */
export async function acquireLock(
  key: string,
  ttlMs: number = 5000,
  retries: number = 3
): Promise<string | null> {
  const lockId = crypto.randomUUID();

  for (let i = 0; i < retries; i++) {
    try {
      const result = await redis.set(key, lockId, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return lockId;
      }
    } catch (error) {
      console.error(`Redis error during acquireLock for key ${key}:`, error);
    }

    await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
  }

  return null;
}

/**
 * Releases a distributed lock using a LUA script to ensure that ONLY the 
 * owner of the lock (identified by lockId) can release it.
 * 
 * @param key - The unique resource key to unlock
 * @param lockId - The unique identifier returned by acquireLock
 * @returns True if the lock was successfully released, false otherwise
 */
export async function releaseLock(
  key: string,
  lockId: string
): Promise<boolean> {
  const luaScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  try {
    const result = await redis.eval(luaScript, 1, key, lockId);
    return result === 1;
  } catch (error) {
    console.error(`Redis error during releaseLock for key ${key}:`, error);
    return false;
  }
}
