import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { getEvents } from '../controllers/events.js';
import { EventPageSchema, EventQuerySchema } from '../schemas/events.js';

export const eventsRoutes: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.get(
    '/',
    { schema: { querystring: EventQuerySchema, response: { 200: EventPageSchema } } },
    getEvents,
  );
};
