import type { Worker } from 'bullmq';

import { logger } from './common/logger.js';
import type { ReservationExpiryJobData, ReservationSweepJobData } from './common/types/index.js';
import { pool } from './db/index.js';
import { reservationSweepQueue, scheduleReservationSweep } from './queues/reservation-sweep.js';
import { createReservationExpiryWorker } from './workers/reservation-expiry.js';
import { createReservationSweepWorker } from './workers/reservation-sweep.js';

const expiryWorker: Worker<ReservationExpiryJobData, boolean> = createReservationExpiryWorker();
const sweepWorker: Worker<ReservationSweepJobData, number> = createReservationSweepWorker();

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info({ signal }, 'Shutting down worker');

  try {
    await Promise.all([expiryWorker.close(), sweepWorker.close(), reservationSweepQueue.close()]);
    await pool.end();
    process.exit(0);
  } catch (error: unknown) {
    logger.error({ err: error }, 'Worker shutdown failed');
    process.exit(1);
  }
};

process.once('SIGINT', (signal: NodeJS.Signals): void => void shutdown(signal));
process.once('SIGTERM', (signal: NodeJS.Signals): void => void shutdown(signal));

try {
  await scheduleReservationSweep();
} catch (error: unknown) {
  logger.error({ err: error }, 'Failed to schedule reservation sweep');
  process.exit(1);
}

logger.info('Reservation expiry and sweep worker started');
