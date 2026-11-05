import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  TokenResponse,
  UserCredentials,
  UserDB,
  UserResponse,
} from '../common/types/index.js';
import { createUser, verifyCredentials } from '../services/users.js';

const toUserResponse = (user: UserDB): UserResponse => {
  return {
    id: user.id,
    email: user.email,
  };
};

export const register = async (
  request: FastifyRequest<{ Body: UserCredentials }>,
  reply: FastifyReply,
): Promise<UserResponse> => {
  const { email, password }: UserCredentials = request.body;

  const user: UserDB = await createUser(email, password);

  reply.status(201);

  return toUserResponse(user);
};

export const login = async (
  request: FastifyRequest<{ Body: UserCredentials }>,
  reply: FastifyReply,
): Promise<TokenResponse> => {
  const { email, password }: UserCredentials = request.body;

  const user: UserDB = await verifyCredentials(email, password);

  const token: string = await reply.jwtSign({ sub: user.id });

  return { token };
};
