import IORedis from 'ioredis';
import { env } from './env';

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: false,
});

redis.on('connect', () => {
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', err.message);
});
