import { Queue, Worker, QueueEvents, Job, Processor } from 'bullmq';
import { RedisClient } from './redisClient';
import { QUEUE_CONFIG, REDIS_CONFIG } from '../../configs/queueConfig';

export class QueueFactory {
  /**
   * Creates a new Queue instance
   * @param queueName Name of the queue
   */
  static createQueue(queueName: string): Queue {
    const connection = RedisClient.getInstance();
    
    return new Queue(queueName, {
      connection: connection as any,
      defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
    });
  }

  /**
   * Creates a new Worker instance to process jobs
   * @param queueName Name of the queue to consume
   * @param processor Function to process jobs
   */
  static createWorker<T>(
    queueName: string, 
    processor: Processor<T>
  ): Worker<T> {
    const connection = RedisClient.getInstance();

    const worker = new Worker<T>(queueName, processor, {
      connection: connection as any,
      ...QUEUE_CONFIG.workerOptions,
    });

    worker.on('completed', (job: Job) => {
      console.log(`Job ${job.id} on queue ${queueName} completed successfully`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`Job ${job?.id} on queue ${queueName} failed: ${err.message}`);
    });

    return worker;
  }

  /**
   * Creates QueueEvents listener (optional, for global monitoring)
   * @param queueName Name of the queue
   */
  static createQueueEvents(queueName: string): QueueEvents {
    const connection = RedisClient.getInstance();
    return new QueueEvents(queueName, { connection: connection as any });
  }
}
