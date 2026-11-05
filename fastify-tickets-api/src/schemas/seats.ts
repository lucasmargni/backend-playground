import { Type } from 'typebox';

export const SeatStatusSchema = Type.Union([
  Type.Literal('available'),
  Type.Literal('held'),
  Type.Literal('sold'),
]);

export const SeatSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  row: Type.String(),
  number: Type.Integer({ minimum: 1 }),
  status: SeatStatusSchema,
});

export const EventSeatsSchema = Type.Object({
  eventId: Type.String({ format: 'uuid' }),
  seats: Type.Array(SeatSchema),
});
