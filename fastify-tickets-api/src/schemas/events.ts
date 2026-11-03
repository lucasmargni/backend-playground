import { Type } from 'typebox';

export const EventSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  startsAt: Type.String({ format: 'date-time' }),
  priceCents: Type.Integer(),
});

export const EventPageSchema = Type.Object({
  data: Type.Array(EventSchema),
  page: Type.Integer(),
  limit: Type.Integer(),
  total: Type.Integer(),
});

export const EventQuerySchema = Type.Object({
  from: Type.Optional(Type.String({ format: 'date-time' })),
  to: Type.Optional(Type.String({ format: 'date-time' })),
  minPriceCents: Type.Optional(Type.Integer({ minimum: 0 })),
  maxPriceCents: Type.Optional(Type.Integer({ minimum: 0 })),
  page: Type.Integer({ minimum: 1, default: 1 }),
  limit: Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
});
