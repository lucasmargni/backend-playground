import { Queue } from 'bullmq';

import type { ReservationExpiryJobData } from '../common/types/index.js';
import { redisConnection } from './connection.js';

export const RESERVATION_EXPIRY_QUEUE: string = 'reservation-expiry';

export const reservationExpiryQueue: Queue<ReservationExpiryJobData, boolean> = new Queue(
  RESERVATION_EXPIRY_QUEUE,
  { connection: redisConnection },
);
