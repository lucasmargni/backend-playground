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
  toReservationResult,
} from './reservations-shared.js';
import { updateSeatStatus } from './seats.js';

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

      const updatedSeatIds: string[] = await updateSeatStatus(tx, condition, 'held');

      if (updatedSeatIds.length !== seatIds.length) {
        throw new Error(
          `Pessimistic hold updated ${updatedSeatIds.length} of ${seatIds.length} locked seats`,
        );
      }

      const reservation: ReservationDB = await insertReservation(tx, { userId, eventId, seatIds });

      return toReservationResult(reservation, seatIds, event);
    });
  } catch (error: unknown) {
    throw toReservationError(error);
  }
};
