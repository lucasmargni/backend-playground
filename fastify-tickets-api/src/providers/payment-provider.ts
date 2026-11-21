import { setTimeout as sleep } from 'node:timers/promises';

import type { Redis } from 'ioredis';

import { logger } from '../common/logger.js';
import type { ChargeStatus } from '../common/types/index.js';
import { createRedisConnection } from '../queues/connection.js';

const APPROVAL_RATE: number = 0.8;
const MAX_LATENCY_MS: number = 1000;
const MIN_LATENCY_MS: number = 100;
const SLOW_RESPONSE_PROBABILITY: number = 0.05;
const SLOW_LATENCY_MS: number = 12000;
const CHARGE_TTL_SECONDS: number = 60 * 60 * 24;

const paymentConnection: Redis = createRedisConnection({ enableOfflineQueue: false });
paymentConnection.on('error', (error: Error): void => {
  logger.error({ err: error }, 'Payment provider redis connection error');
});

const createChargeKey = (idempotencyKey: string): string => {
  return `provider:charge:${idempotencyKey}`;
};

const createChargeCountKey = (idempotencyKey: string): string => {
  return `provider:charge-count:${idempotencyKey}`;
};

export const closePaymentProvider = async (): Promise<'OK'> => {
  return paymentConnection.quit();
};

const pickLatencyMs = (): number => {
  return Math.random() < SLOW_RESPONSE_PROBABILITY
    ? SLOW_LATENCY_MS
    : Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS) + MIN_LATENCY_MS;
};

const isChargeStatus = (value: string): value is ChargeStatus => {
  return value === 'approved' || value === 'rejected';
};

export const charge = async (
  idempotencyKey: string,
  amountCents: number,
): Promise<ChargeStatus> => {
  const decidedStatus: ChargeStatus = Math.random() < APPROVAL_RATE ? 'approved' : 'rejected';
  let storedStatus: ChargeStatus;

  const isNewCharge: boolean =
    (await paymentConnection.set(
      createChargeKey(idempotencyKey),
      decidedStatus,
      'EX',
      CHARGE_TTL_SECONDS,
      'NX',
    )) === 'OK';

  if (isNewCharge) {
    await paymentConnection.incr(createChargeCountKey(idempotencyKey));
    await paymentConnection.expire(createChargeCountKey(idempotencyKey), CHARGE_TTL_SECONDS);

    logger.info(
      { idempotencyKey, amountCents, status: decidedStatus },
      'Payment provider processed new charge',
    );

    storedStatus = decidedStatus;
  } else {
    const storedValue: string | null = await paymentConnection.get(createChargeKey(idempotencyKey));

    if (!storedValue || !isChargeStatus(storedValue)) {
      throw new Error(
        `Payment provider found missing or invalid charge status for idempotency key "${idempotencyKey}"`,
      );
    }

    storedStatus = storedValue;
  }

  const latencyMs: number = pickLatencyMs();

  await sleep(latencyMs);

  return storedStatus;
};
