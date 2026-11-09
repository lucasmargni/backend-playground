import { and, eq, inArray, type SQL } from 'drizzle-orm';

import { SeatsUnavailableError } from '../common/errors/index.js';
import type {
  CreateReservationInput,
  CreateReservationService,
  EventDB,
  NewSeatHold,
  ReservationDB,
  ReservationResult,
  SeatDB,
  Transaction,
} from '../common/types/index.js';
import { isPostgresViolation, SEAT_HOLDS_PKEY, UNIQUE_VIOLATION } from '../db/errors.js';
import { db } from '../db/index.js';
import { seatHolds, seats } from '../db/schema.js';
import { findEvent } from './events.js';
import {
  assertSeatsReservable,
  insertReservation,
  toReservationError,
  toReservationResult,
} from './reservations-shared.js';
import { updateSeatStatus } from './seats.js';

type SeatHoldRow = {
  seatId: string;
};

const findHeldSeatIds = async (seatIds: string[]): Promise<string[]> => {
  try {
    const rows: SeatHoldRow[] = await db
      .select({ seatId: seatHolds.seatId })
      .from(seatHolds)
      .where(inArray(seatHolds.seatId, seatIds));

    return rows.map((row: SeatHoldRow): string => row.seatId);
  } catch (error: unknown) {
    throw new Error('Failed to look up held seats after a seat_holds conflict', { cause: error });
  }
};

export const createConstraintReservation: CreateReservationService = async ({
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

      const foundSeats: SeatDB[] = await tx.select().from(seats).where(condition);
      assertSeatsReservable(seatIds, foundSeats);

      await updateSeatStatus(tx, condition, 'held');

      const reservation: ReservationDB = await insertReservation(tx, { userId, eventId, seatIds });

      await tx
        .insert(seatHolds)
        .values(
          seatIds.map((seatId: string): NewSeatHold => ({ seatId, reservationId: reservation.id })),
        );

      return toReservationResult(reservation, seatIds, event);
    });
  } catch (error: unknown) {
    if (isPostgresViolation(error, { code: UNIQUE_VIOLATION, constraint: SEAT_HOLDS_PKEY })) {
      const heldSeatIds: string[] = await findHeldSeatIds(seatIds);

      throw new SeatsUnavailableError(heldSeatIds.length > 0 ? heldSeatIds : seatIds);
    }

    throw toReservationError(error);
  }
};
