import dotenv from 'dotenv';
dotenv.config();

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'kipi:',
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
