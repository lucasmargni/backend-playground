import { Queue } from 'bullmq';

import type { ReservationDB, ReservationExpiryJobData } from '../common/types/index.js';
import { redisConnection } from './connection.js';
import { EXPIRE_RESERVATION_JOB, RESERVATION_EXPIRY_QUEUE } from './names.js';

export const reservationExpiryQueue: Queue<ReservationExpiryJobData, boolean> = new Queue(
  RESERVATION_EXPIRY_QUEUE,
  { connection: { ...redisConnection, enableOfflineQueue: false } },
);

export const scheduleReservationExpiry = async (reservation: ReservationDB): Promise<void> => {
  const delay: number = Math.max(0, reservation.expiresAt.getTime() - Date.now());

  await reservationExpiryQueue.add(
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
  );
};
