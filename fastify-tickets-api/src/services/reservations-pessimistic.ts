import { and, eq, inArray, type SQL } from 'drizzle-orm';

import type {
  CreateReservationInput,
  CreateReservationService,
  EventDB,
  ReservationDB,
  ReservationResult,
  SeatDB,
  Transaction,
} from '../common/types/index.js';
import { db } from '../db/index.js';
import { seats } from '../db/schema.js';
import { findEvent } from './events.js';
import {
  assertSeatsReservable,
  insertReservation,
  toReservationError,
} from './reservations-shared.js';

export const createPessimisticReservation: CreateReservationService = async ({
  userId,
  eventId,
  seatIds,
}: CreateReservationInput): Promise<ReservationResult> => {
  try {
    const event: EventDB = await findEvent(eventId);

    return await db.transaction(async (tx: Transaction): Promise<ReservationResult> => {
      const condition: SQL | undefined = and(
        eq(seats.eventId, eventId),
        inArray(seats.id, seatIds),
      );

      const foundSeats: SeatDB[] = await tx
        .select()
        .from(seats)
        .where(condition)
        .orderBy(seats.id)
        .for('update');
      assertSeatsReservable(seatIds, foundSeats);

      await tx.update(seats).set({ status: 'held' }).where(condition);

      const reservation: ReservationDB = await insertReservation(tx, { userId, eventId, seatIds });

      return { reservation, seatIds, totalCents: event.priceCents * seatIds.length };
    });
  } catch (error: unknown) {
    throw toReservationError(error);
  }
};
