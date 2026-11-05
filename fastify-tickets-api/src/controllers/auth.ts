import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  LoginBody,
  RegisterBody,
  TokenResponse,
  UserDB,
  UserResponse,
} from '../common/types/index.js';
import { createUser, findAuthenticatedUser, verifyCredentials } from '../services/users.js';

const toUserResponse = (user: UserDB): UserResponse => {
  return {
    id: user.id,
    email: user.email,
  };
};

export const register = async (
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply,
): Promise<UserResponse> => {
  const { email, password }: RegisterBody = request.body;

  const user: UserDB = await createUser(email, password);

  reply.status(201);

  return toUserResponse(user);
};

export const login = async (
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
): Promise<TokenResponse> => {
  const { email, password }: LoginBody = request.body;

  const user: UserDB = await verifyCredentials(email, password);

  const token: string = await reply.jwtSign({ sub: user.id });

  return { token };
};

export const getCurrentUser = async (request: FastifyRequest): Promise<UserResponse> => {
  const userId: string = request.user.sub;

  const user: UserDB = await findAuthenticatedUser(userId);

  return toUserResponse(user);
};
