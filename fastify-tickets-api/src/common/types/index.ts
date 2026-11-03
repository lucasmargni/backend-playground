import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import type { Static } from 'typebox';

import type {
  events,
  orders,
  reservations,
  reservationSeats,
  seats,
  users,
} from '../../db/schema.js';
import type { EventSchema } from '../../schemas/events.js';

export type AppInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export type EventResponse = Static<typeof EventSchema>;

export type NewUser = typeof users.$inferInsert;
export type NewEvent = typeof events.$inferInsert;
export type NewSeat = typeof seats.$inferInsert;
export type NewReservation = typeof reservations.$inferInsert;
export type NewReservationSeats = typeof reservationSeats.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;

export type UserDB = typeof users.$inferSelect;
export type EventDB = typeof events.$inferSelect;
export type SeatDB = typeof seats.$inferSelect;
export type ReservationDB = typeof reservations.$inferSelect;
export type ReservationSeatsDB = typeof reservationSeats.$inferSelect;
export type OrderDB = typeof orders.$inferSelect;
