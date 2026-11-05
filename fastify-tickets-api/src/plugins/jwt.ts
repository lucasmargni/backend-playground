import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import fp from 'fastify-plugin';

import type { AppInstance } from '../common/types/index.js';

const jwtSecret: string | undefined = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

const jwt: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  await app.register(fastifyJwt, { secret: jwtSecret, sign: { expiresIn: '1h' } });
};

export const jwtPlugin: FastifyPluginAsyncTypebox = fp(jwt);
