import { and, count, eq, sql, type SQL } from 'drizzle-orm';

import {
  ActivePaymentExistsError,
  IdempotencyKeyMismatchError,
  NotFoundError,
  PaymentInProgressError,
  PaymentProviderError,
  ReservationNotPayableError,
} from '../common/errors/index.js';
import { logger } from '../common/logger.js';
import type {
  ChargeStatus,
  Count,
  EventPriceRow,
  LockedReservation,
  OrderDB,
  OrderStatusDB,
  PayReservationInput,
  PendingOrderResult,
  ReservationDB,
  Transaction,
} from '../common/types/index.js';
import { withTimeout } from '../common/utils/timeout.js';
import {
  isPostgresViolation,
  ORDERS_IDEMPOTENCY_KEY_UNIQUE,
  ORDERS_RESERVATION_ID_ACTIVE_UNIQUE,
  UNIQUE_VIOLATION,
} from '../db/errors.js';
import { db } from '../db/index.js';
import { events, orders, reservations, reservationSeats } from '../db/schema.js';
import { charge } from '../providers/payment-provider.js';
import { calculateTotalCents } from './reservations-shared.js';
import { updateReservationSeatStatus } from './seats.js';

type UserReservationIds = Pick<PayReservationInput, 'userId' | 'reservationId'>;

const PAYMENT_PROVIDER_TIMEOUT_MS: number = 10000;

const lockReservation = async (
  tx: Transaction,
  condition: SQL | undefined,
): Promise<LockedReservation | undefined> => {
  if (condition === undefined) {
    throw new Error('lockReservation requires a condition');
  }

  const [lockedReservation]: LockedReservation[] = await tx
    .select({
      reservation: reservations,
      isExpired: sql<boolean>`${reservations.expiresAt} <= now()`,
    })
    .from(reservations)
    .where(condition)
    .for('update');

  return lockedReservation;
};

const lockOwnedReservation = async (
  tx: Transaction,
  { userId, reservationId }: UserReservationIds,
): Promise<LockedReservation> => {
  const lockedReservation: LockedReservation | undefined = await lockReservation(
    tx,
    and(eq(reservations.id, reservationId), eq(reservations.userId, userId)),
  );

  if (!lockedReservation) {
    throw new NotFoundError('Reservation', reservationId);
  }

  return lockedReservation;
};

const findOrderByIdempotencyKey = async (
  tx: Transaction,
  idempotencyKey: string,
): Promise<OrderDB | undefined> => {
  const [order]: OrderDB[] = await tx
    .select()
    .from(orders)
    .where(eq(orders.idempotencyKey, idempotencyKey));

  return order;
};

const calculateOrderAmountCents = async (
  tx: Transaction,
  reservation: ReservationDB,
): Promise<number> => {
  const [eventPriceRow]: EventPriceRow[] = await tx
    .select({ priceCents: events.priceCents })
    .from(events)
    .where(eq(events.id, reservation.eventId));

  if (!eventPriceRow) {
    throw new NotFoundError('Event', reservation.eventId);
  }

  const [countRow]: Count[] = await tx
    .select({ count: count() })
    .from(reservationSeats)
    .where(eq(reservationSeats.reservationId, reservation.id));

  if (!countRow) {
    throw new Error('COUNT returned no rows');
  }

  return calculateTotalCents(eventPriceRow.priceCents, countRow.count);
};

const insertPendingOrder = async (
  tx: Transaction,
  reservationId: string,
  amountCents: number,
  idempotencyKey: string,
): Promise<OrderDB> => {
  const [order]: OrderDB[] = await tx
    .insert(orders)
    .values({ reservationId, amountCents, idempotencyKey })
    .returning();

  if (!order) {
    throw new Error('Order insert returned no rows');
  }

  return order;
};

const requestCharge = async (order: OrderDB): Promise<ChargeStatus> => {
  try {
    return await withTimeout(
      charge(order.idempotencyKey, order.amountCents),
      PAYMENT_PROVIDER_TIMEOUT_MS,
      `Payment provider did not respond within ${PAYMENT_PROVIDER_TIMEOUT_MS} ms`,
    );
  } catch (error: unknown) {
    logger.warn(
      { err: error, orderId: order.id, idempotencyKey: order.idempotencyKey },
      'Payment provider charge failed, order left pending for recovery',
    );
    throw new PaymentProviderError(order.idempotencyKey);
  }
};

const toOrderStatus = (chargeStatus: ChargeStatus): OrderStatusDB => {
  const chargeToOrder: Record<ChargeStatus, OrderStatusDB> = {
    approved: 'paid',
    rejected: 'failed',
  };

  return chargeToOrder[chargeStatus];
};

export const createPendingOrder = async (
  input: PayReservationInput,
): Promise<PendingOrderResult> => {
  try {
    return await db.transaction(async (tx: Transaction): Promise<PendingOrderResult> => {
      const { reservation, isExpired }: LockedReservation = await lockOwnedReservation(tx, input);

      const existingOrder: OrderDB | undefined = await findOrderByIdempotencyKey(
        tx,
        input.idempotencyKey,
      );

      if (existingOrder) {
        if (existingOrder.reservationId !== reservation.id) {
          throw new IdempotencyKeyMismatchError(input.idempotencyKey);
        }

        return { order: existingOrder, kind: 'existing' };
      }

      if (reservation.status !== 'pending' || isExpired) {
        throw new ReservationNotPayableError(reservation.id);
      }

      const amountCents: number = await calculateOrderAmountCents(tx, reservation);

      const order: OrderDB = await insertPendingOrder(
        tx,
        reservation.id,
        amountCents,
        input.idempotencyKey,
      );

      return { order, kind: 'created' };
    });
  } catch (error: unknown) {
    if (
      isPostgresViolation(error, {
        code: UNIQUE_VIOLATION,
        constraint: ORDERS_RESERVATION_ID_ACTIVE_UNIQUE,
      })
    ) {
      throw new ActivePaymentExistsError(input.reservationId);
    }

    if (
      isPostgresViolation(error, {
        code: UNIQUE_VIOLATION,
        constraint: ORDERS_IDEMPOTENCY_KEY_UNIQUE,
      })
    ) {
      throw new IdempotencyKeyMismatchError(input.idempotencyKey);
    }

    throw error;
  }
};

export const finalizeOrder = async (
  order: OrderDB,
  chargeStatus: ChargeStatus,
): Promise<OrderDB> => {
  return db.transaction(async (tx: Transaction): Promise<OrderDB> => {
    const lockedReservation: LockedReservation | undefined = await lockReservation(
      tx,
      eq(reservations.id, order.reservationId),
    );

    if (!lockedReservation) {
      throw new Error(`Reservation ${order.reservationId} of order ${order.id} not found`);
    }

    const [finalizedOrder]: OrderDB[] = await tx
      .update(orders)
      .set({ status: toOrderStatus(chargeStatus) })
      .where(and(eq(orders.id, order.id), eq(orders.status, 'pending')))
      .returning();

    if (!finalizedOrder) {
      const existingOrder: OrderDB | undefined = await findOrderByIdempotencyKey(
        tx,
        order.idempotencyKey,
      );

      if (!existingOrder) {
        throw new Error(`Order ${order.id} not found after its conditional update matched no rows`);
      }

      return existingOrder;
    }

    if (finalizedOrder.status === 'paid') {
      if (lockedReservation.reservation.status !== 'pending') {
        throw new Error(
          `Reservation ${lockedReservation.reservation.id} is no longer pending after an approved charge for order ${order.id}`,
        );
      }

      await tx
        .update(reservations)
        .set({ status: 'confirmed' })
        .where(eq(reservations.id, lockedReservation.reservation.id));

      await updateReservationSeatStatus(tx, lockedReservation.reservation.id, 'sold');
    }

    return finalizedOrder;
  });
};

export const payReservation = async (input: PayReservationInput): Promise<OrderDB> => {
  const { order, kind }: PendingOrderResult = await createPendingOrder(input);

  if (kind === 'existing') {
    if (order.status === 'pending') {
      throw new PaymentInProgressError(input.idempotencyKey);
    }

    return order;
  }

  const chargeStatus: ChargeStatus = await requestCharge(order);

  return finalizeOrder(order, chargeStatus);
};
