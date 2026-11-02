import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

const app: FastifyInstance = buildApp();
const port: number = Number(process.env.PORT ?? 3000);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
