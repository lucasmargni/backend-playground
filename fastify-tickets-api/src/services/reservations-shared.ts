import { sql } from 'drizzle-orm';

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
import { FOREIGN_KEY_VIOLATION, isPostgresViolation, RESERVATIONS_USER_FK } from '../db/errors.js';
import { reservations, reservationSeats } from '../db/schema.js';

const HOLD_DURATION_MINUTES: number = 15;

export const assertSeatsReservable = (seatIds: string[], foundSeats: SeatDB[]): void => {
  const missingSeatIds: string[] = findMissingSeatIds(
    seatIds,
    foundSeats.map((seat: SeatDB): string => seat.id),
  );

  if (missingSeatIds.length > 0) {
    throw new SeatsNotFoundError(missingSeatIds);
  }

  const unavailableSeatIds: string[] = foundSeats
    .filter((seat: SeatDB): boolean => seat.status !== 'available')
    .map((seat: SeatDB): string => seat.id);

  if (unavailableSeatIds.length > 0) {
    throw new SeatsUnavailableError(unavailableSeatIds);
  }
};

export const insertReservation = async (
  tx: Transaction,
  { userId, eventId, seatIds }: CreateReservationInput,
): Promise<ReservationDB> => {
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

  return reservation;
};

export const findMissingSeatIds = (seatIds: string[], presentSeatIds: string[]): string[] => {
  const presentSeatIdsSet: Set<string> = new Set(presentSeatIds);

  return seatIds.filter((seatId: string): boolean => !presentSeatIdsSet.has(seatId));
};

export const toReservationError = (error: unknown): unknown => {
  if (
    isPostgresViolation(error, { code: FOREIGN_KEY_VIOLATION, constraint: RESERVATIONS_USER_FK })
  ) {
    return new UnknownUserError();
  }

  return error;
};

export const toReservationResult = (
  reservation: ReservationDB,
  seatIds: string[],
  event: EventDB,
): ReservationResult => {
  return { reservation, seatIds, totalCents: event.priceCents * seatIds.length };
};
