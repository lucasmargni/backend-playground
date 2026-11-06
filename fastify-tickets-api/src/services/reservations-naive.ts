import { and, eq, inArray, sql, type SQL } from 'drizzle-orm';

import {
  SeatsNotFoundError,
  SeatsUnavailableError,
  UnknownUserError,
} from '../common/errors/index.js';
import type {
  CreateReservationInput,
  EventDB,
  NewReservationSeat,
  ReservationDB,
  ReservationResult,
  SeatDB,
  Transaction,
} from '../common/types/index.js';
import { FOREIGN_KEY_VIOLATION, hasPostgresErrorCode } from '../db/errors.js';
import { db } from '../db/index.js';
import { reservations, reservationSeats, seats } from '../db/schema.js';
import { findEvent } from './events.js';

const HOLD_DURATION_MINUTES: number = 15;

export const createNaiveReservation = async ({
  userId,
  eventId,
  seatIds,
}: CreateReservationInput): Promise<ReservationResult> => {
  try {
    const event: EventDB = await findEvent(eventId);

    return await db.transaction(async (tx: Transaction): Promise<ReservationResult> => {
      const conditionSeats: SQL | undefined = and(
        eq(seats.eventId, eventId),
        inArray(seats.id, seatIds),
      );

      const foundSeats: SeatDB[] = await tx.select().from(seats).where(conditionSeats);
      const foundSeatIds: Set<string> = new Set(foundSeats.map((seat: SeatDB): string => seat.id));

      const missingSeats: string[] = seatIds.filter(
        (seatId: string): boolean => !foundSeatIds.has(seatId),
      );

      if (missingSeats.length > 0) {
        throw new SeatsNotFoundError(missingSeats);
      }

      const unavailableSeats: string[] = foundSeats
        .filter((seat: SeatDB): boolean => seat.status !== 'available')
        .map((seat: SeatDB): string => seat.id);

      if (unavailableSeats.length > 0) {
        throw new SeatsUnavailableError(unavailableSeats);
      }

      await tx.update(seats).set({ status: 'held' }).where(conditionSeats);

      const [reservation]: ReservationDB[] = await tx
        .insert(reservations)
        .values({
          userId,
          eventId,
          expiresAt: sql`now() + make_interval(mins => ${HOLD_DURATION_MINUTES})`,
        })
        .returning();

      if (!reservation) {
        throw new Error('Reservation insert returned no rows');
      }

      await tx.insert(reservationSeats).values(
        seatIds.map((seatId: string): NewReservationSeat => ({
          reservationId: reservation.id,
          seatId,
        })),
      );

      return { reservation, seatIds, totalCents: event.priceCents * foundSeats.length };
    });
  } catch (error: unknown) {
    if (hasPostgresErrorCode(error, FOREIGN_KEY_VIOLATION)) {
      throw new UnknownUserError();
    }

    throw error;
  }
};
