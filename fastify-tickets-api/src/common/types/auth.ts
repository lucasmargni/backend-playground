import type { Static } from 'typebox';

import type { TokenSchema } from '../../schemas/auth.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export type JwtPayload = { sub: string };

export type TokenResponse = Static<typeof TokenSchema>;
