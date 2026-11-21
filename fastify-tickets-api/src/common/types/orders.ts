import type { Static } from 'typebox';

import type { IdempotencyKeyHeadersSchema, OrderSchema } from '../../schemas/orders.js';
import type { OrderDB, OrderStatusDB } from './db.js';

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

export type FinalOrderStatus = Exclude<OrderStatusDB, 'pending'>;
export type FinalOrder = Omit<OrderDB, 'status'> & { status: FinalOrderStatus };
