import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { OrderRecoveryJobData, OrderRecoveryResult } from '../common/types/index.js';
import { ORDER_RECOVERY_QUEUE } from '../queues/names.js';
import { recoverStuckOrders } from '../services/payments-recovery.js';

const ORDER_RECOVERY_CONCURRENCY: number = 1;

export const processOrderRecovery = async (
  _job: Job<OrderRecoveryJobData, OrderRecoveryResult>,
): Promise<OrderRecoveryResult> => {
  const orderRecoveryResult: OrderRecoveryResult = await recoverStuckOrders();

  if (orderRecoveryResult.overdueCount > 0) {
    logger.error(
      { overdueCount: orderRecoveryResult.overdueCount },
      'Orders stuck past the recovery window need manual review',
    );
  }

  if (orderRecoveryResult.failedCount > 0) {
    logger.warn(orderRecoveryResult, 'Order recovery job completed with failures');
  } else if (orderRecoveryResult.recoveredCount > 0) {
    logger.info(
      { recoveredCount: orderRecoveryResult.recoveredCount },
      'Order recovery job processed',
    );
  }

  return orderRecoveryResult;
};

export const createOrderRecoveryWorker = (
  connection: Redis,
): Worker<OrderRecoveryJobData, OrderRecoveryResult> => {
  const worker: Worker<OrderRecoveryJobData, OrderRecoveryResult> = new Worker(
    ORDER_RECOVERY_QUEUE,
    processOrderRecovery,
    {
      connection,
      concurrency: ORDER_RECOVERY_CONCURRENCY,
    },
  );

  worker.on(
    'failed',
    (job: Job<OrderRecoveryJobData, OrderRecoveryResult> | undefined, error: Error): void => {
      logger.error(
        {
          err: error,
          jobId: job?.id,
          attempt: job?.attemptsMade,
        },
        'Order recovery job failed',
      );
    },
  );

  worker.on('error', (error: Error): void => {
    logger.error(
      {
        err: error,
      },
      'Order recovery worker error',
    );
  });

  return worker;
};
