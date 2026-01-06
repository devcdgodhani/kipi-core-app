import { ENV_VARIABLE } from './env';

export const REDIS_CONFIG = {
  host: ENV_VARIABLE.REDIS_HOST || 'localhost',
  port: ENV_VARIABLE.REDIS_PORT || 6379,
  password: ENV_VARIABLE.REDIS_PASSWORD || undefined,
  db: ENV_VARIABLE.REDIS_DB || 0,
  keyPrefix: ENV_VARIABLE.REDIS_KEY_PREFIX || 'kipi:',
};

export const QUEUE_CONFIG = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 3600, // keep for 24 hours
      count: 1000, // keep max 1000 jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // keep for 7 days
    },
  },
  workerOptions: {
    concurrency: 5,
  },
};
