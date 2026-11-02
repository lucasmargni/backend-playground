import Fastify, { type FastifyInstance } from 'fastify';
import type { HealthResponse } from './common/types/index.js';

export const buildApp = (): FastifyInstance => {
  const app: FastifyInstance = Fastify({ logger: true });

  app.get<{ Reply: HealthResponse }>('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
