import sensible from '@fastify/sensible';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';
import { Type, type Static } from 'typebox';

import type { AppInstance } from './common/types/index.js';
import { eventsRoutes } from './routes/events.js';

const HealthSchema = Type.Object({ status: Type.String() });
type HealthResponse = Static<typeof HealthSchema>;

export const buildApp = (): AppInstance => {
  const app: AppInstance = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  app.get('/health', { schema: { response: { 200: HealthSchema } } }, (): HealthResponse => {
    return { status: 'ok' };
  });

  app.register(sensible);
  app.register(eventsRoutes, { prefix: '/events' });

  return app;
};
