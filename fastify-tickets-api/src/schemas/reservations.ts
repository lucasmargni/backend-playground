import { Type } from 'typebox';

export const MAX_SEATS_PER_RESERVATION: number = 10;

export const ReservationStatusSchema = Type.Union([
  Type.Literal('pending'),
  Type.Literal('confirmed'),
  Type.Literal('expired'),
  Type.Literal('cancelled'),
]);

export const CreateReservationBodySchema = Type.Object({
  eventId: Type.String({ format: 'uuid' }),
  seatIds: Type.Array(Type.String({ format: 'uuid' }), {
    uniqueItems: true,
    minItems: 1,
    maxItems: MAX_SEATS_PER_RESERVATION,
  }),
});

export const ReservationSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  eventId: Type.String({ format: 'uuid' }),
  seatIds: Type.Array(Type.String({ format: 'uuid' })),
  status: ReservationStatusSchema,
  totalCents: Type.Integer({ minimum: 0 }),
  expiresAt: Type.String({ format: 'date-time' }),
  createdAt: Type.String({ format: 'date-time' }),
});
