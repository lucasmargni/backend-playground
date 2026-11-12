import { Queue } from 'bullmq';

import type { ReservationDB, ReservationExpiryJobData } from '../common/types/index.js';
import { redisConnection } from './connection.js';

export const RESERVATION_EXPIRY_QUEUE: string = 'reservation-expiry';
export const EXPIRE_RESERVATION_JOB: string = 'expire-reservation';

export const reservationExpiryQueue: Queue<ReservationExpiryJobData, boolean> = new Queue(
  RESERVATION_EXPIRY_QUEUE,
  { connection: { ...redisConnection, enableOfflineQueue: false } },
);

export const scheduleReservationExpiry = async (reservation: ReservationDB): Promise<void> => {
  const delay: number = Math.max(0, reservation.expiresAt.getTime() - Date.now());

  await reservationExpiryQueue.add(
    EXPIRE_RESERVATION_JOB,
    { reservationId: reservation.id },
    { jobId: reservation.id, delay, removeOnComplete: true, removeOnFail: { count: 1000 } },
  );
};
