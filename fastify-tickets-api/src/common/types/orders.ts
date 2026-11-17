import type { Static } from 'typebox';

import type {
  IdempotencyKeyHeadersSchema,
  OrderSchema,
  OrderStatusSchema,
} from '../../schemas/orders.js';

export type OrderStatus = Static<typeof OrderStatusSchema>;

export type OrderResponse = Static<typeof OrderSchema>;

export type IdempotencyKeyHeaders = Static<typeof IdempotencyKeyHeadersSchema>;
