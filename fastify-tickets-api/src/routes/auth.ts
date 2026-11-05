import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { register } from '../controllers/auth.js';
import { UserCredentialsSchema, UserSchema } from '../schemas/users.js';

export const authRoutes: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.post(
    '/register',
    { schema: { body: UserCredentialsSchema, response: { 201: UserSchema } } },
    register,
  );
};
