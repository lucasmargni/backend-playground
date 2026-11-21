import type { Queue, Worker } from 'bullmq';
import type { Redis } from 'ioredis';

import { logger } from './common/logger.js';
import type {
  OrderRecoveryJobData,
  OrderRecoveryResult,
  ReservationExpiryJobData,
  ReservationSweepJobData,
  ReservationSweepResult,
} from './common/types/index.js';
import { withTimeout } from './common/utils/timeout.js';
import { pool } from './db/index.js';
import { createRedisConnection, workerRedisOptions } from './queues/connection.js';
import { createOrderRecoveryQueue, scheduleOrderRecovery } from './queues/order-recovery.js';
import {
  createReservationSweepQueue,
  scheduleReservationSweep,
} from './queues/reservation-sweep.js';
import { createOrderRecoveryWorker } from './workers/order-recovery.js';
import { createReservationExpiryWorker } from './workers/reservation-expiry.js';
import { createReservationSweepWorker } from './workers/reservation-sweep.js';

const SHUTDOWN_RESOURCE_TIMEOUT_MS: number = 3000;

const expiryWorkerConnection: Redis = createRedisConnection(workerRedisOptions);
const sweepWorkerConnection: Redis = createRedisConnection(workerRedisOptions);
const orderRecoveryWorkerConnection: Redis = createRedisConnection(workerRedisOptions);
const sweepQueueConnection: Redis = createRedisConnection({ enableOfflineQueue: true });
const orderRecoveryQueueConnection: Redis = createRedisConnection({ enableOfflineQueue: true });

const expiryWorker: Worker<ReservationExpiryJobData, boolean> =
  createReservationExpiryWorker(expiryWorkerConnection);
const sweepWorker: Worker<ReservationSweepJobData, ReservationSweepResult> =
  createReservationSweepWorker(sweepWorkerConnection);
const orderRecoveryWorker: Worker<OrderRecoveryJobData, OrderRecoveryResult> =
  createOrderRecoveryWorker(orderRecoveryWorkerConnection);

const sweepQueue: Queue<ReservationSweepJobData, ReservationSweepResult> =
  createReservationSweepQueue(sweepQueueConnection);
const orderRecoveryQueue: Queue<OrderRecoveryJobData, OrderRecoveryResult> =
  createOrderRecoveryQueue(orderRecoveryQueueConnection);

let isShuttingDown: boolean = false;

const closeResource = async (name: string, close: Promise<unknown>): Promise<boolean> => {
  try {
    await withTimeout(
      close,
      SHUTDOWN_RESOURCE_TIMEOUT_MS,
      `${name} did not close within ${SHUTDOWN_RESOURCE_TIMEOUT_MS} ms`,
    );
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
    closeResource('Order recovery worker', orderRecoveryWorker.close()),
    closeResource('Sweep queue', sweepQueue.close()),
    closeResource('Order recovery queue', orderRecoveryQueue.close()),
  ]);
  const connectionsClosed: boolean[] = await Promise.all([
    closeResource('Expiry worker redis connection', expiryWorkerConnection.quit()),
    closeResource('Sweep worker redis connection', sweepWorkerConnection.quit()),
    closeResource('Order recovery worker redis connection', orderRecoveryWorkerConnection.quit()),
    closeResource('Sweep queue redis connection', sweepQueueConnection.quit()),
    closeResource('Order recovery queue redis connection', orderRecoveryQueueConnection.quit()),
    closeResource('Postgres pool', pool.end()),
  ]);

  const allClosed: boolean = [...bullmqClosed, ...connectionsClosed].every(
    (closed: boolean): boolean => closed,
  );

  process.exit(allClosed ? 0 : 1);
};

const handleSignal = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) {
    logger.warn({ signal }, 'Forced shutdown');
    process.exit(1);
  }

  isShuttingDown = true;
  void shutdown(signal);
};

process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);

try {
  await Promise.all([
    scheduleReservationSweep(sweepQueue),
    scheduleOrderRecovery(orderRecoveryQueue),
  ]);
  logger.info('Background workers started');
} catch (error: unknown) {
  if (!isShuttingDown) {
    logger.error({ err: error }, 'Failed to schedule recurring jobs');
    process.exit(1);
  }
}
