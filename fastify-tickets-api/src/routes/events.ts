import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { getEvent, getEvents } from '../controllers/events.js';
import { getEventSeats } from '../controllers/seats.js';
import {
  EventDetailsSchema,
  EventPageSchema,
  EventParamsSchema,
  EventQuerySchema,
} from '../schemas/events.js';
import { EventSeatsSchema } from '../schemas/seats.js';

export const eventsRoutes: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.get(
    '/',
    { schema: { querystring: EventQuerySchema, response: { 200: EventPageSchema } } },
    getEvents,
  );

  app.get(
    '/:eventId',
    { schema: { params: EventParamsSchema, response: { 200: EventDetailsSchema } } },
    getEvent,
  );

  app.get(
    '/:eventId/seats',
    { schema: { params: EventParamsSchema, response: { 200: EventSeatsSchema } } },
    getEventSeats,
  );
};
