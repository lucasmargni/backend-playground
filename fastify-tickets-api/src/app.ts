import sensible from '@fastify/sensible';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';
import { Type, type Static } from 'typebox';

import { logger } from './common/logger.js';
import type { AppInstance } from './common/types/index.js';
import { errorHandlerPlugin } from './plugins/error-handler.js';
import { jwtPlugin } from './plugins/jwt.js';
import { authRoutes } from './routes/auth.js';
import { benchmarkRoutes } from './routes/benchmark.js';
import { eventsRoutes } from './routes/events.js';
import { reservationsRoutes } from './routes/reservations.js';

const HealthSchema = Type.Object({ status: Type.String() });
type HealthResponse = Static<typeof HealthSchema>;

const BENCHMARK_ROUTES_PREFIX: string = '/benchmark/reservations';
const benchmarkRoutesEnv: string | undefined = process.env.ENABLE_BENCHMARK_ROUTES;

if (
  benchmarkRoutesEnv !== undefined &&
  benchmarkRoutesEnv !== 'true' &&
  benchmarkRoutesEnv !== 'false'
) {
  throw new Error(
    `Invalid ENABLE_BENCHMARK_ROUTES "${benchmarkRoutesEnv}", expected one of: "true", "false" or unset`,
  );
}

const enableBenchmarkRoutes: boolean = benchmarkRoutesEnv === 'true';

export const buildApp = (): AppInstance => {
  const app: AppInstance = Fastify({
    loggerInstance: logger,
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.get('/health', { schema: { response: { 200: HealthSchema } } }, (): HealthResponse => {
    return { status: 'ok' };
  });

  app.register(sensible);
  app.register(errorHandlerPlugin);
  app.register(jwtPlugin);
  app.register(eventsRoutes, { prefix: '/events' });
  app.register(authRoutes, { prefix: '/auth' });
  app.register(reservationsRoutes, { prefix: '/reservations' });

  if (enableBenchmarkRoutes) {
    app.register(benchmarkRoutes, { prefix: BENCHMARK_ROUTES_PREFIX });
    app.log.warn(
      { prefix: BENCHMARK_ROUTES_PREFIX },
      'Benchmark routes enabled, never enable them in production',
    );
  }

  return app;
};
