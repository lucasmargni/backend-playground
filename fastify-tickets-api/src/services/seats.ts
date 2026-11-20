import { asc, eq, inArray, sql, type SQL } from 'drizzle-orm';

import type { SeatDB, SeatIdRow, SeatStatusDB, Transaction } from '../common/types/index.js';
import { db } from '../db/index.js';
import { reservationSeats, seats } from '../db/schema.js';
import { findEvent } from './events.js';

export const findEventSeats = async (eventId: string): Promise<SeatDB[]> => {
  await findEvent(eventId);

  return db
    .select()
    .from(seats)
    .where(eq(seats.eventId, eventId))
    .orderBy(asc(seats.row), asc(seats.number));
};

/** Single entry point for seat status writes: always bumps `version` for optimistic locking */
export const updateSeatStatus = async (
  tx: Transaction,
  condition: SQL | undefined,
  status: SeatStatusDB,
): Promise<string[]> => {
  if (condition === undefined) {
    throw new Error('updateSeatStatus requires a condition');
  }

  const rows: SeatIdRow[] = await tx
    .update(seats)
    .set({ status, version: sql`${seats.version} + 1` })
    .where(condition)
    .returning({ id: seats.id });

  return rows.map((row: SeatIdRow): string => row.id);
};

export const updateReservationSeatStatus = async (
  tx: Transaction,
  reservationId: string,
  status: SeatStatusDB,
): Promise<void> => {
  const rows: SeatIdRow[] = await tx
    .select({ id: reservationSeats.seatId })
    .from(reservationSeats)
    .where(eq(reservationSeats.reservationId, reservationId));

  const seatIds: string[] = rows.map((row: SeatIdRow): string => row.id);

  await updateSeatStatus(tx, inArray(seats.id, seatIds), status);
};
