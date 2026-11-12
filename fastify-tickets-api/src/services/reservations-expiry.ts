import { and, eq, inArray, lte, sql } from 'drizzle-orm';

import type { ReservationDB, SeatIdRow, Transaction } from '../common/types/index.js';
import { db } from '../db/index.js';
import { reservations, reservationSeats, seats } from '../db/schema.js';
import { updateSeatStatus } from './seats.js';

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
