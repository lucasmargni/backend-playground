import { Type } from 'typebox';

export const EventSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  startsAt: Type.String({ format: 'date-time' }),
  priceCents: Type.Integer(),
});

export const EventListSchema = Type.Array(EventSchema);
