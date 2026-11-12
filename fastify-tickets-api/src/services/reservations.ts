import { logger } from '../common/logger.js';
import type {
  CreateReservationInput,
  CreateReservationService,
  ReservationResult,
} from '../common/types/index.js';
import { scheduleReservationExpiry } from '../queues/reservation-expiry.js';
import { createOptimisticReservation } from './reservations-optimistic.js';

export const createReservation: CreateReservationService = async (
  input: CreateReservationInput,
): Promise<ReservationResult> => {
  const reservationResult: ReservationResult = await createOptimisticReservation(input);

  try {
    await scheduleReservationExpiry(reservationResult.reservation);
  } catch (error: unknown) {
    logger.error(
      { err: error, reservationId: reservationResult.reservation.id },
      'Failed to schedule reservation expiry, the sweeper will release it',
    );
  }

  return reservationResult;
};
