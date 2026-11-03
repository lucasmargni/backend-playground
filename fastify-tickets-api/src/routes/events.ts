import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { getEvents } from '../controllers/events.js';
import { EventListSchema } from '../schemas/events.js';

export const eventsRoutes: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.get('/', { schema: { response: { 200: EventListSchema } } }, getEvents);
};
