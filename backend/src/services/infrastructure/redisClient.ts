import IORedis, { Redis } from 'ioredis';
import { REDIS_CONFIG } from '../../configs/queueConfig';

export class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new IORedis({
        host: REDIS_CONFIG.host,
        port: REDIS_CONFIG.port,
        password: REDIS_CONFIG.password,
        db: REDIS_CONFIG.db,
        // keyPrefix: REDIS_CONFIG.keyPrefix, // Removed: BullMQ handles prefixing separately
        maxRetriesPerRequest: null, // Critical for BullMQ
        enableReadyCheck: false,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      RedisClient.instance.on('connect', () => {
        console.log('Redis connected successfully');
      });

      RedisClient.instance.on('error', (err) => {
        console.error('Redis connection error:', err);
      });
    }

    return RedisClient.instance;
  }
}
