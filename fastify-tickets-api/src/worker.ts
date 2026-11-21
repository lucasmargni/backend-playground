import type { Queue } from 'bullmq';
import type { Redis, RedisOptions } from 'ioredis';

import { logger } from './common/logger.js';
import type {
  OrderRecoveryJobData,
  OrderRecoveryResult,
  ReservationSweepJobData,
  ReservationSweepResult,
} from './common/types/index.js';
import { withTimeout } from './common/utils/timeout.js';
import { pool } from './db/index.js';
import { closePaymentProvider } from './providers/payment-provider.js';
import { createRedisConnection, workerRedisOptions } from './queues/connection.js';
import { createOrderRecoveryQueue, scheduleOrderRecovery } from './queues/order-recovery.js';
import {
  createReservationSweepQueue,
  scheduleReservationSweep,
} from './queues/reservation-sweep.js';
import { MAX_RECOVERY_RUN_MS } from './services/payments-recovery.js';
import { createOrderRecoveryWorker } from './workers/order-recovery.js';
import { createReservationExpiryWorker } from './workers/reservation-expiry.js';
import { createReservationSweepWorker } from './workers/reservation-sweep.js';

type Closable = { close: () => Promise<void> };
type BackgroundResource<TResource extends Closable = Closable> = {
  name: string;
  connection: Redis;
  resource: TResource;
  closeTimeoutMs?: number;
};

const SHUTDOWN_RESOURCE_TIMEOUT_MS: number = 3000;

const createBackgroundResource = <TResource extends Closable>(
  name: string,
  createResource: (connection: Redis) => TResource,
  connectionOptions: RedisOptions,
  closeTimeoutMs?: number,
): BackgroundResource<TResource> => {
  const connection: Redis = createRedisConnection(connectionOptions);
  const resource: TResource = createResource(connection);

  return { name, connection, resource, closeTimeoutMs };
};

const sweepQueueResource: BackgroundResource<
  Queue<ReservationSweepJobData, ReservationSweepResult>
> = createBackgroundResource('Sweep queue', createReservationSweepQueue, {
  enableOfflineQueue: true,
});
const orderRecoveryQueueResource: BackgroundResource<
  Queue<OrderRecoveryJobData, OrderRecoveryResult>
> = createBackgroundResource('Order recovery queue', createOrderRecoveryQueue, {
  enableOfflineQueue: true,
});

const backgroundResources: BackgroundResource[] = [
  createBackgroundResource('Expiry worker', createReservationExpiryWorker, workerRedisOptions),
  createBackgroundResource('Sweep worker', createReservationSweepWorker, workerRedisOptions),
  createBackgroundResource(
    'Order recovery worker',
    createOrderRecoveryWorker,
    workerRedisOptions,
    MAX_RECOVERY_RUN_MS + SHUTDOWN_RESOURCE_TIMEOUT_MS,
  ),
  sweepQueueResource,
  orderRecoveryQueueResource,
];

let isShuttingDown: boolean = false;

const closeResource = async (
  name: string,
  close: Promise<unknown>,
  timeoutMs: number = SHUTDOWN_RESOURCE_TIMEOUT_MS,
): Promise<boolean> => {
  try {
    await withTimeout(close, timeoutMs, `${name} did not close within ${timeoutMs} ms`);
    return true;
  } catch (error: unknown) {
    logger.error({ err: error, resource: name }, 'Failed to close resource');
    return false;
  }
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info({ signal }, 'Shutting down worker');

  const bullmqClosed: boolean[] = await Promise.all(
    backgroundResources.map((backgroundResource: BackgroundResource): Promise<boolean> =>
      closeResource(
        backgroundResource.name,
        backgroundResource.resource.close(),
        backgroundResource.closeTimeoutMs,
      ),
    ),
  );
  const connectionsClosed: boolean[] = await Promise.all([
    ...backgroundResources.map((backgroundResource: BackgroundResource): Promise<boolean> =>
      closeResource(
        `${backgroundResource.name} redis connection`,
        backgroundResource.connection.quit(),
      ),
    ),
    closeResource('Postgres pool', pool.end()),
    closeResource('Payment provider redis connection', closePaymentProvider()),
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
    scheduleReservationSweep(sweepQueueResource.resource),
    scheduleOrderRecovery(orderRecoveryQueueResource.resource),
  ]);
  logger.info('Background workers started');
} catch (error: unknown) {
  if (!isShuttingDown) {
    logger.error({ err: error }, 'Failed to schedule recurring jobs');
    process.exit(1);
  }
}
