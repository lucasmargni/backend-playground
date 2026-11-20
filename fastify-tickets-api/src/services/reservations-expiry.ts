import { and, eq, lte, notExists, sql } from 'drizzle-orm';

import { logger } from '../common/logger.js';
import type {
  LockedReservation,
  OrderIdRow,
  ReservationIdRow,
  ReservationSweepResult,
  Transaction,
} from '../common/types/index.js';
import { db } from '../db/index.js';
import { orders, reservations } from '../db/schema.js';
import { lockReservation } from './reservations-shared.js';
import { updateReservationSeatStatus } from './seats.js';

const SWEEP_BATCH_SIZE: number = 100;

const hasPendingOrder = async (tx: Transaction, reservationId: string): Promise<boolean> => {
  const rows: OrderIdRow[] = await tx
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.reservationId, reservationId), eq(orders.status, 'pending')))
    .limit(1);

  return rows.length > 0;
};

export const expireReservation = async (reservationId: string): Promise<boolean> => {
  return db.transaction(async (tx: Transaction): Promise<boolean> => {
    const lockedReservation: LockedReservation | undefined = await lockReservation(
      tx,
      eq(reservations.id, reservationId),
    );

    if (
      !lockedReservation ||
      lockedReservation.reservation.status !== 'pending' ||
      !lockedReservation.isExpired ||
      (await hasPendingOrder(tx, reservationId))
    ) {
      return false;
    }

    await tx
      .update(reservations)
      .set({ status: 'expired' })
      .where(eq(reservations.id, reservationId));

    await updateReservationSeatStatus(tx, reservationId, 'available');

    return true;
  });
};

const findExpiredReservationIds = async (limit: number): Promise<string[]> => {
  const reservationRows: ReservationIdRow[] = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.status, 'pending'),
        lte(reservations.expiresAt, sql`now()`),
        notExists(
          db
            .select({ id: orders.id })
            .from(orders)
            .where(and(eq(orders.reservationId, reservations.id), eq(orders.status, 'pending'))),
        ),
      ),
    )
    .orderBy(reservations.expiresAt)
    .limit(limit);

  return reservationRows.map((reservationRow: ReservationIdRow): string => reservationRow.id);
};

export const sweepExpiredReservations = async (): Promise<ReservationSweepResult> => {
  const expiredReservationIds: string[] = await findExpiredReservationIds(SWEEP_BATCH_SIZE);
  let expiredCount: number = 0;
  let failedCount: number = 0;

  for (const reservationId of expiredReservationIds) {
    try {
      const expired: boolean = await expireReservation(reservationId);

      if (expired) {
        expiredCount++;
      }
    } catch (error: unknown) {
      failedCount++;
      logger.error({ err: error, reservationId }, 'Reservation sweep failed to expire reservation');
    }
  }

  return { expiredCount, failedCount, foundCount: expiredReservationIds.length };
};
