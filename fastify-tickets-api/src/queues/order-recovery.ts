import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { OrderRecoveryJobData, OrderRecoveryResult } from '../common/types/index.js';
import { ORDER_RECOVERY_QUEUE, ORDER_RECOVERY_SCHEDULER_ID, RECOVER_ORDERS_JOB } from './names.js';

const ORDER_RECOVERY_INTERVAL_MS: number = 60000;

export const createOrderRecoveryQueue = (
  connection: Redis,
): Queue<OrderRecoveryJobData, OrderRecoveryResult> => {
  const queue: Queue<OrderRecoveryJobData, OrderRecoveryResult> = new Queue(ORDER_RECOVERY_QUEUE, {
    connection,
  });

  queue.on('error', (error: Error): void => {
    logger.error(
      {
        err: error,
      },
      'Order recovery queue error',
    );
  });

  return queue;
};

export const scheduleOrderRecovery = async (
  queue: Queue<OrderRecoveryJobData, OrderRecoveryResult>,
): Promise<void> => {
  await queue.upsertJobScheduler(
    ORDER_RECOVERY_SCHEDULER_ID,
    { every: ORDER_RECOVERY_INTERVAL_MS },
    {
      name: RECOVER_ORDERS_JOB,
      data: {},
      opts: { removeOnComplete: true, removeOnFail: { count: 1000 } },
    },
  );
};
