import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import type { seats } from '../../db/schema.js';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export type AppInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export type HealthResponse = {
  status: string;
};

export type NewSeat = typeof seats.$inferInsert;
