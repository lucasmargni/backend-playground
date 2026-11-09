import { and, eq, inArray, or, type SQL } from 'drizzle-orm';

import { SeatsUnavailableError } from '../common/errors/index.js';
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
  findMissingSeatIds,
  insertReservation,
  toReservationError,
  toReservationResult,
} from './reservations-shared.js';
import { updateSeatStatus } from './seats.js';

export const createOptimisticReservation: CreateReservationService = async ({
  userId,
  eventId,
  seatIds,
}: CreateReservationInput): Promise<ReservationResult> => {
  try {
    const event: EventDB = await findEvent(eventId);

    return await db.transaction(async (tx: Transaction): Promise<ReservationResult> => {
      const selectCondition: SQL | undefined = and(
        eq(seats.eventId, eventId),
        inArray(seats.id, seatIds),
      );

      const foundSeats: SeatDB[] = await tx.select().from(seats).where(selectCondition);
      assertSeatsReservable(seatIds, foundSeats);

      const updateCondition: SQL | undefined = or(
        ...foundSeats.map((seat: SeatDB): SQL | undefined =>
          and(eq(seats.id, seat.id), eq(seats.version, seat.version)),
        ),
      );

      const updatedSeatIds: string[] = await updateSeatStatus(tx, updateCondition, 'held');
      const unavailableSeatIds: string[] = findMissingSeatIds(seatIds, updatedSeatIds);

      if (unavailableSeatIds.length > 0) {
        throw new SeatsUnavailableError(unavailableSeatIds);
      }

      const reservation: ReservationDB = await insertReservation(tx, { userId, eventId, seatIds });

      return toReservationResult(reservation, seatIds, event);
    });
  } catch (error: unknown) {
    throw toReservationError(error);
  }
};
