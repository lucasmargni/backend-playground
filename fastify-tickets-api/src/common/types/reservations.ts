import type { Static } from 'typebox';

import type {
  CreateReservationBodySchema,
  ReservationSchema,
  ReservationStatusSchema,
} from '../../schemas/reservations.js';

export type ReservationResponse = Static<typeof ReservationSchema>;

export type ReservationStatus = Static<typeof ReservationStatusSchema>;

export type CreateReservationBody = Static<typeof CreateReservationBodySchema>;
