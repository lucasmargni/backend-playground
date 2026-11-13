import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { ReservationSweepJobData } from '../common/types/index.js';
import { RESERVATION_SWEEP_QUEUE } from '../queues/names.js';
import { sweepExpiredReservations } from '../services/reservations-expiry.js';

const RESERVATION_SWEEP_CONCURRENCY: number = 1;

export const processReservationSweep = async (
  _job: Job<ReservationSweepJobData, number>,
): Promise<number> => {
  const expiredCount: number = await sweepExpiredReservations();

  if (expiredCount > 0) {
    logger.info({ expiredCount }, 'Reservation sweep job processed');
  }

  return expiredCount;
};

export const createReservationSweepWorker = (
  connection: Redis,
): Worker<ReservationSweepJobData, number> => {
  const worker: Worker<ReservationSweepJobData, number> = new Worker(
    RESERVATION_SWEEP_QUEUE,
    processReservationSweep,
    {
      connection,
      concurrency: RESERVATION_SWEEP_CONCURRENCY,
    },
  );

  worker.on(
    'failed',
    (job: Job<ReservationSweepJobData, number> | undefined, error: Error): void => {
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
