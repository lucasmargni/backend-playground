import { Queue } from 'bullmq';

import { logger } from '../common/logger.js';
import type { ReservationSweepJobData } from '../common/types/index.js';
import { createRedisConnection } from './connection.js';
import {
  RESERVATION_SWEEP_QUEUE,
  RESERVATION_SWEEP_SCHEDULER_ID,
  SWEEP_RESERVATIONS_JOB,
} from './names.js';

const RESERVATION_SWEEP_INTERVAL_MS: number = 30000;

export const reservationSweepQueue: Queue<ReservationSweepJobData, number> = new Queue(
  RESERVATION_SWEEP_QUEUE,
  { connection: createRedisConnection({ enableOfflineQueue: true }) },
).on('error', (error: Error): void => {
  logger.error(
    {
      err: error,
    },
    'Reservation sweep queue error',
  );
});

export const scheduleReservationSweep = async (): Promise<void> => {
  await reservationSweepQueue.upsertJobScheduler(
    RESERVATION_SWEEP_SCHEDULER_ID,
    { every: RESERVATION_SWEEP_INTERVAL_MS },
    {
      name: SWEEP_RESERVATIONS_JOB,
      data: {},
      opts: { removeOnComplete: true, removeOnFail: { count: 1000 } },
    },
  );
};
