import { and, eq, inArray, lte, sql } from 'drizzle-orm';

import { logger } from '../common/logger.js';
import type {
  ReservationDB,
  ReservationIdRow,
  ReservationSweepResult,
  SeatIdRow,
  Transaction,
} from '../common/types/index.js';
import { db } from '../db/index.js';
import { reservations, reservationSeats, seats } from '../db/schema.js';
import { updateSeatStatus } from './seats.js';

const SWEEP_BATCH_SIZE: number = 100;

export const expireReservation = async (reservationId: string): Promise<boolean> => {
  return db.transaction(async (tx: Transaction): Promise<boolean> => {
    const [reservation]: ReservationDB[] = await tx
      .update(reservations)
      .set({ status: 'expired' })
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.status, 'pending'),
          lte(reservations.expiresAt, sql`now()`),
        ),
      )
      .returning();

    if (!reservation) {
      return false;
    }

    const reservationSeatRows: SeatIdRow[] = await tx
      .select({ id: reservationSeats.seatId })
      .from(reservationSeats)
      .where(eq(reservationSeats.reservationId, reservation.id));

    const seatIds: string[] = reservationSeatRows.map(
      (reservationSeatRow: SeatIdRow): string => reservationSeatRow.id,
    );

    await updateSeatStatus(tx, inArray(seats.id, seatIds), 'available');

    return true;
  });
};

const findExpiredReservationIds = async (limit: number): Promise<string[]> => {
  const reservationRows: ReservationIdRow[] = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(and(eq(reservations.status, 'pending'), lte(reservations.expiresAt, sql`now()`)))
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
