import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type {
  events,
  orders,
  reservations,
  reservationSeats,
  seats,
  users,
} from '../../db/schema.js';

export type Transaction = Parameters<Parameters<NodePgDatabase['transaction']>[0]>[0];

export type NewUser = typeof users.$inferInsert;
export type NewEvent = typeof events.$inferInsert;
export type NewSeat = typeof seats.$inferInsert;
export type NewReservation = typeof reservations.$inferInsert;
export type NewReservationSeat = typeof reservationSeats.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;

export type UserDB = typeof users.$inferSelect;
export type EventDB = typeof events.$inferSelect;
export type SeatDB = typeof seats.$inferSelect;
export type ReservationDB = typeof reservations.$inferSelect;
export type ReservationSeatDB = typeof reservationSeats.$inferSelect;
export type OrderDB = typeof orders.$inferSelect;
