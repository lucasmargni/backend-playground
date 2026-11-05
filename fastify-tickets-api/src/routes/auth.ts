import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { getCurrentUser, login, register } from '../controllers/auth.js';
import { authenticate } from '../plugins/jwt.js';
import { TokenSchema } from '../schemas/auth.js';
import { UserCredentialsSchema, UserSchema } from '../schemas/users.js';

export const authRoutes: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.post(
    '/register',
    { schema: { body: UserCredentialsSchema, response: { 201: UserSchema } } },
    register,
  );

  app.post(
    '/login',
    { schema: { body: UserCredentialsSchema, response: { 200: TokenSchema } } },
    login,
  );

  app.get(
    '/me',
    { onRequest: authenticate, schema: { response: { 200: UserSchema } } },
    getCurrentUser,
  );
};
