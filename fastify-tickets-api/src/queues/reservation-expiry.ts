import { Queue } from 'bullmq';

import { logger } from '../common/logger.js';
import type { ReservationDB, ReservationExpiryJobData } from '../common/types/index.js';
import { withTimeout } from '../common/utils/timeout.js';
import { createRedisConnection } from './connection.js';
import { EXPIRE_RESERVATION_JOB, RESERVATION_EXPIRY_QUEUE } from './names.js';

const RESERVATION_EXPIRY_SCHEDULE_TIMEOUT_MS: number = 2000;
const RESERVATION_EXPIRY_GRACE_MS: number = 1000;

export const reservationExpiryQueue: Queue<ReservationExpiryJobData, boolean> = new Queue(
  RESERVATION_EXPIRY_QUEUE,
  { connection: createRedisConnection({ enableOfflineQueue: false }) },
);

reservationExpiryQueue.on('error', (error: Error): void => {
  logger.error(
    {
      err: error,
    },
    'Reservation expiry queue error',
  );
});

export const scheduleReservationExpiry = async (reservation: ReservationDB): Promise<void> => {
  const delay: number = Math.max(
    0,
    reservation.expiresAt.getTime() - Date.now() + RESERVATION_EXPIRY_GRACE_MS,
  );

  await withTimeout(
    reservationExpiryQueue.add(
      EXPIRE_RESERVATION_JOB,
      { reservationId: reservation.id },
      {
        jobId: reservation.id,
        delay,
        removeOnComplete: true,
        removeOnFail: { count: 1000 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    ),
    RESERVATION_EXPIRY_SCHEDULE_TIMEOUT_MS,
    'Timed out scheduling reservation expiry',
  );
};
