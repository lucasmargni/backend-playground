import { and, between, count, eq, lt, sql, type SQL } from 'drizzle-orm';

import { PaymentProviderError } from '../common/errors/index.js';
import { logger } from '../common/logger.js';
import type { ChargeStatus, Count, OrderDB, OrderRecoveryResult } from '../common/types/index.js';
import { db } from '../db/index.js';
import { orders } from '../db/schema.js';
import { finalizeOrder, requestCharge } from './payments.js';

const RECOVERY_BATCH_SIZE: number = 5;
const STUCK_ORDER_MIN_AGE: SQL = sql`interval '2 minutes'`;
const STUCK_ORDER_MAX_AGE: SQL = sql`interval '24 hours'`;

const findStuckOrders = async (limit: number): Promise<OrderDB[]> => {
  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, 'pending'),
        between(
          orders.createdAt,
          sql`now() - ${STUCK_ORDER_MAX_AGE}`,
          sql`now() - ${STUCK_ORDER_MIN_AGE}`,
        ),
      ),
    )
    .orderBy(orders.createdAt)
    .limit(limit);
};

const countOverdueOrders = async (): Promise<number> => {
  const [countRow]: Count[] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(eq(orders.status, 'pending'), lt(orders.createdAt, sql`now() - ${STUCK_ORDER_MAX_AGE}`)),
    );

  if (!countRow) {
    throw new Error('COUNT returned no rows');
  }

  return countRow.count;
};

export const recoverStuckOrders = async (): Promise<OrderRecoveryResult> => {
  let recoveredCount: number = 0;
  let failedCount: number = 0;

  const [stuckOrders, overdueCount]: [OrderDB[], number] = await Promise.all([
    findStuckOrders(RECOVERY_BATCH_SIZE),
    countOverdueOrders(),
  ]);

  for (const order of stuckOrders) {
    try {
      const chargeStatus: ChargeStatus = await requestCharge(order);
      const finalizedOrder: OrderDB = await finalizeOrder(order, chargeStatus);

      recoveredCount++;

      logger.info(
        {
          orderId: finalizedOrder.id,
          idempotencyKey: finalizedOrder.idempotencyKey,
          status: finalizedOrder.status,
        },
        'Stuck order recovered',
      );
    } catch (error: unknown) {
      failedCount++;

      if (!(error instanceof PaymentProviderError)) {
        logger.error(
          { err: error, orderId: order.id, idempotencyKey: order.idempotencyKey },
          'Stuck order recovery failed',
        );
      }
    }
  }

  return { foundCount: stuckOrders.length, recoveredCount, failedCount, overdueCount };
};
