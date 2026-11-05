import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { ConflictError, DomainError, NotFoundError } from '../common/errors/index.js';
import type { AppInstance, DomainErrorClass } from '../common/types/index.js';

type ErrorWithCode = { errorClass: DomainErrorClass; statusCode: number };

const errorStatusCodes: ErrorWithCode[] = [
  { errorClass: NotFoundError, statusCode: 404 },
  { errorClass: ConflictError, statusCode: 409 },
];

const errorHandler: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.setErrorHandler((error: Error, request: FastifyRequest, _reply: FastifyReply): never => {
    if (!(error instanceof DomainError)) {
      throw error;
    }

    const errorStatusCode: ErrorWithCode | undefined = errorStatusCodes.find(
      (item: ErrorWithCode) => error instanceof item.errorClass,
    );

    if (!errorStatusCode) {
      throw error;
    }

    throw request.server.httpErrors.createError(errorStatusCode.statusCode, error.message);
  });
};

export const errorHandlerPlugin: FastifyPluginAsyncTypebox = fp(errorHandler);
