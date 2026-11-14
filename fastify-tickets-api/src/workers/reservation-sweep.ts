import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { ReservationSweepJobData, ReservationSweepResult } from '../common/types/index.js';
import { RESERVATION_SWEEP_QUEUE } from '../queues/names.js';
import { sweepExpiredReservations } from '../services/reservations-expiry.js';

const RESERVATION_SWEEP_CONCURRENCY: number = 1;

export const processReservationSweep = async (
  _job: Job<ReservationSweepJobData, ReservationSweepResult>,
): Promise<ReservationSweepResult> => {
  const sweepResult: ReservationSweepResult = await sweepExpiredReservations();

  if (sweepResult.failedCount > 0 && sweepResult.failedCount === sweepResult.foundCount) {
    throw new Error(
      `Reservation sweep failed to expire all ${sweepResult.failedCount} reservations`,
    );
  } else if (sweepResult.failedCount > 0) {
    logger.warn(sweepResult, 'Reservation sweep job completed with failures');
  } else if (sweepResult.expiredCount > 0) {
    logger.info({ expiredCount: sweepResult.expiredCount }, 'Reservation sweep job processed');
  }

  return sweepResult;
};

export const createReservationSweepWorker = (
  connection: Redis,
): Worker<ReservationSweepJobData, ReservationSweepResult> => {
  const worker: Worker<ReservationSweepJobData, ReservationSweepResult> = new Worker(
    RESERVATION_SWEEP_QUEUE,
    processReservationSweep,
    {
      connection,
      concurrency: RESERVATION_SWEEP_CONCURRENCY,
    },
  );

  worker.on(
    'failed',
    (job: Job<ReservationSweepJobData, ReservationSweepResult> | undefined, error: Error): void => {
      logger.error(
        {
          err: error,
          jobId: job?.id,
          attempt: job?.attemptsMade,
        },
        'Reservation sweep job failed',
      );
    },
  );

  worker.on('error', (error: Error): void => {
    logger.error(
      {
        err: error,
      },
      'Reservation sweep worker error',
    );
  });

  return worker;
};
