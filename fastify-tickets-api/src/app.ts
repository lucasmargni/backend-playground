import Fastify from 'fastify';
import type { AppInstance, HealthResponse } from './common/types/index.js';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export const buildApp = (): AppInstance => {
  const app: AppInstance = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  app.get<{ Reply: HealthResponse }>('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
