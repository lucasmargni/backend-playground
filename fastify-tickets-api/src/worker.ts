import type { Queue, Worker } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from './common/logger.js';
import type { ReservationExpiryJobData, ReservationSweepJobData } from './common/types/index.js';
import { pool } from './db/index.js';
import { createRedisConnection, workerRedisOptions } from './queues/connection.js';
import {
  createReservationSweepQueue,
  scheduleReservationSweep,
} from './queues/reservation-sweep.js';
import { createReservationExpiryWorker } from './workers/reservation-expiry.js';
import { createReservationSweepWorker } from './workers/reservation-sweep.js';

const expiryWorkerConnection: Redis = createRedisConnection(workerRedisOptions);
const sweepWorkerConnection: Redis = createRedisConnection(workerRedisOptions);
const sweepQueueConnection: Redis = createRedisConnection({ enableOfflineQueue: true });

const expiryWorker: Worker<ReservationExpiryJobData, boolean> =
  createReservationExpiryWorker(expiryWorkerConnection);
const sweepWorker: Worker<ReservationSweepJobData, number> =
  createReservationSweepWorker(sweepWorkerConnection);

const sweepQueue: Queue<ReservationSweepJobData, number> =
  createReservationSweepQueue(sweepQueueConnection);

const closeResource = async (name: string, close: Promise<unknown>): Promise<boolean> => {
  try {
    await close;
    return true;
  } catch (error: unknown) {
    logger.error({ err: error, resource: name }, 'Failed to close resource');
    return false;
  }
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info({ signal }, 'Shutting down worker');

  const bullmqClosed: boolean[] = await Promise.all([
    closeResource('Expiry worker', expiryWorker.close()),
    closeResource('Sweep worker', sweepWorker.close()),
    closeResource('Sweep queue', sweepQueue.close()),
  ]);
  const connectionClosed: boolean[] = await Promise.all([
    closeResource('Expiry worker redis connection', expiryWorkerConnection.quit()),
    closeResource('Sweep worker redis connection', sweepWorkerConnection.quit()),
    closeResource('Sweep queue connection', sweepQueueConnection.quit()),
    closeResource('Postgres pool', pool.end()),
  ]);

  const allClosed: boolean = [...bullmqClosed, ...connectionClosed].every(
    (bool: boolean): boolean => bool,
  );

  process.exit(allClosed ? 0 : 1);
};

process.once('SIGINT', (signal: NodeJS.Signals): void => void shutdown(signal));
process.once('SIGTERM', (signal: NodeJS.Signals): void => void shutdown(signal));

try {
  await scheduleReservationSweep(sweepQueue);
} catch (error: unknown) {
  logger.error({ err: error }, 'Failed to schedule reservation sweep');
  process.exit(1);
}

logger.info('Reservation expiry and sweep worker started');
