import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { ReservationSweepJobData, ReservationSweepResult } from '../common/types/index.js';
import {
  RESERVATION_SWEEP_QUEUE,
  RESERVATION_SWEEP_SCHEDULER_ID,
  SWEEP_RESERVATIONS_JOB,
} from './names.js';

const RESERVATION_SWEEP_INTERVAL_MS: number = 30000;

export const createReservationSweepQueue = (
  connection: Redis,
): Queue<ReservationSweepJobData, ReservationSweepResult> => {
  const queue: Queue<ReservationSweepJobData, ReservationSweepResult> = new Queue(
    RESERVATION_SWEEP_QUEUE,
    {
      connection,
    },
  );

  queue.on('error', (error: Error): void => {
    logger.error(
      {
        err: error,
      },
      'Reservation sweep queue error',
    );
  });

  return queue;
};

export const scheduleReservationSweep = async (
  queue: Queue<ReservationSweepJobData, ReservationSweepResult>,
): Promise<void> => {
  await queue.upsertJobScheduler(
    RESERVATION_SWEEP_SCHEDULER_ID,
    { every: RESERVATION_SWEEP_INTERVAL_MS },
    {
      name: SWEEP_RESERVATIONS_JOB,
      data: {},
      opts: { removeOnComplete: true, removeOnFail: { count: 1000 } },
    },
  );
};
