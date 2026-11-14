import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { ReservationExpiryJobData } from '../common/types/index.js';
import { RESERVATION_EXPIRY_QUEUE } from '../queues/names.js';
import { expireReservation } from '../services/reservations-expiry.js';

const RESERVATION_EXPIRY_CONCURRENCY: number = 5;

type ExpiryFailureLogContext = {
  err: Error;
  reservationId: string | undefined;
  attempt: number | undefined;
  maxAttempts: number;
};

export const processReservationExpiry = async (
  job: Job<ReservationExpiryJobData, boolean>,
): Promise<boolean> => {
  const reservationId: string = job.data.reservationId;
  const expired: boolean = await expireReservation(reservationId);

  logger.info(
    { reservationId, expired, attempt: job.attemptsMade + 1 },
    'Reservation expiry job processed',
  );

  return expired;
};

export const createReservationExpiryWorker = (
  connection: Redis,
): Worker<ReservationExpiryJobData, boolean> => {
  const worker: Worker<ReservationExpiryJobData, boolean> = new Worker(
    RESERVATION_EXPIRY_QUEUE,
    processReservationExpiry,
    {
      connection,
      concurrency: RESERVATION_EXPIRY_CONCURRENCY,
    },
  );

  worker.on(
    'failed',
    (job: Job<ReservationExpiryJobData, boolean> | undefined, error: Error): void => {
      const maxAttempts: number = job?.opts.attempts ?? 1;
      const isFinalFailure: boolean = job === undefined || job.attemptsMade >= maxAttempts;

      const logContext: ExpiryFailureLogContext = {
        err: error,
        reservationId: job?.data.reservationId,
        attempt: job?.attemptsMade,
        maxAttempts,
      };

      if (isFinalFailure) {
        logger.error(logContext, 'Reservation expiry job failed after all attempts');
      } else {
        logger.warn(logContext, 'Reservation expiry job failed, retrying');
      }
    },
  );

  worker.on('error', (error: Error): void => {
    logger.error(
      {
        err: error,
      },
      'Reservation expiry worker error',
    );
  });

  return worker;
};
