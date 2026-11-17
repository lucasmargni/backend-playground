import { Type } from 'typebox';

export const OrderStatusSchema = Type.Union([
  Type.Literal('pending'),
  Type.Literal('paid'),
  Type.Literal('failed'),
]);

export const OrderSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  reservationId: Type.String({ format: 'uuid' }),
  status: OrderStatusSchema,
  amountCents: Type.Integer({ minimum: 1 }),
  createdAt: Type.String({ format: 'date-time' }),
});

export const IdempotencyKeyHeadersSchema = Type.Object({
  'idempotency-key': Type.String({ format: 'uuid' }),
});
