import type { Static } from 'typebox';

import type {
  CreateReservationBodySchema,
  ReservationSchema,
  ReservationStatusSchema,
} from '../../schemas/reservations.js';
import type { ReservationDB } from './db.js';

export type ReservationResponse = Static<typeof ReservationSchema>;

export type ReservationStatus = Static<typeof ReservationStatusSchema>;

export type CreateReservationBody = Static<typeof CreateReservationBodySchema>;

export type CreateReservationInput = {
  userId: string;
  eventId: string;
  seatIds: string[];
};

export type ReservationResult = {
  reservation: ReservationDB;
  seatIds: string[];
  totalCents: number;
};
