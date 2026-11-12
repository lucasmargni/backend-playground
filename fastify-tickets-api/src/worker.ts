import type { Worker } from 'bullmq';

import { logger } from './common/logger.js';
import type { ReservationExpiryJobData } from './common/types/index.js';
import { pool } from './db/index.js';
import { createReservationExpiryWorker } from './workers/reservation-expiry.js';

const worker: Worker<ReservationExpiryJobData, boolean> = createReservationExpiryWorker();

logger.info('Reservation expiry worker started');

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info({ signal }, 'Shutting down worker');

  try {
    await worker.close();
    await pool.end();
    process.exit(0);
  } catch (error: unknown) {
    logger.error({ err: error }, 'Worker shutdown failed');
    process.exit(1);
  }
};

process.once('SIGINT', (signal: NodeJS.Signals): void => void shutdown(signal));
process.once('SIGTERM', (signal: NodeJS.Signals): void => void shutdown(signal));
