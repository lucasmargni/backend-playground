import sensible from '@fastify/sensible';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';
import { Type, type Static } from 'typebox';

import type { AppInstance } from './common/types/index.js';
import { errorHandlerPlugin } from './plugins/error-handler.js';
import { jwtPlugin } from './plugins/jwt.js';
import { authRoutes } from './routes/auth.js';
import { benchmarkRoutes } from './routes/benchmark.js';
import { eventsRoutes } from './routes/events.js';

const HealthSchema = Type.Object({ status: Type.String() });
type HealthResponse = Static<typeof HealthSchema>;

const enableBenchmarkRoutes: boolean = process.env.ENABLE_BENCHMARK_ROUTES === 'true';

export const buildApp = (): AppInstance => {
  const app: AppInstance = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  app.get('/health', { schema: { response: { 200: HealthSchema } } }, (): HealthResponse => {
    return { status: 'ok' };
  });

  app.register(sensible);
  app.register(errorHandlerPlugin);
  app.register(jwtPlugin);
  app.register(eventsRoutes, { prefix: '/events' });
  app.register(authRoutes, { prefix: '/auth' });

  if (enableBenchmarkRoutes) {
    app.register(benchmarkRoutes, { prefix: '/benchmark/reservations' });
  }

  return app;
};
