import type { Static } from 'typebox';

import type {
  IdempotencyKeyHeadersSchema,
  OrderSchema,
  OrderStatusSchema,
} from '../../schemas/orders.js';
import type { OrderDB, ReservationDB } from './db.js';

export type OrderStatus = Static<typeof OrderStatusSchema>;

export type OrderResponse = Static<typeof OrderSchema>;

export type IdempotencyKeyHeaders = Static<typeof IdempotencyKeyHeadersSchema>;

export type PayReservationInput = {
  userId: string;
  reservationId: string;
  idempotencyKey: string;
};

export type PendingOrderResult = {
  order: OrderDB;
  kind: 'existing' | 'created';
};

export type LockedReservation = {
  reservation: ReservationDB;
  isExpired: boolean;
};
