import { and, count, eq, sql } from 'drizzle-orm';

import {
  ActivePaymentExistsError,
  IdempotencyKeyMismatchError,
  NotFoundError,
  ReservationNotPayableError,
} from '../common/errors/index.js';
import type {
  Count,
  EventPriceRow,
  LockedReservation,
  OrderDB,
  PayReservationInput,
  PendingOrderResult,
  ReservationDB,
  Transaction,
} from '../common/types/index.js';
import {
  isPostgresViolation,
  ORDERS_IDEMPOTENCY_KEY_UNIQUE,
  ORDERS_RESERVATION_ID_ACTIVE_UNIQUE,
  UNIQUE_VIOLATION,
} from '../db/errors.js';
import { db } from '../db/index.js';
import { events, orders, reservations, reservationSeats } from '../db/schema.js';
import { calculateTotalCents } from './reservations-shared.js';

type UserReservationIds = Pick<PayReservationInput, 'userId' | 'reservationId'>;

const lockOwnedReservation = async (
  tx: Transaction,
  { userId, reservationId }: UserReservationIds,
): Promise<LockedReservation> => {
  const [lockedReservation]: LockedReservation[] = await tx
    .select({
      reservation: reservations,
      isExpired: sql<boolean>`${reservations.expiresAt} <= now()`,
    })
    .from(reservations)
    .where(and(eq(reservations.id, reservationId), eq(reservations.userId, userId)))
    .for('update');

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
