import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import {
  DomainError,
  DuplicateError,
  InvalidCredentialsError,
  NotFoundError,
  SeatsUnavailableError,
  UnknownUserError,
} from '../common/errors/index.js';
import type { AppInstance, DomainErrorClass } from '../common/types/index.js';

type ErrorStatusMapping = { errorClass: DomainErrorClass; statusCode: number };

// order matters: subclasses must come before their parent classes
const errorStatusMappings: readonly ErrorStatusMapping[] = [
  { errorClass: InvalidCredentialsError, statusCode: 401 },
  { errorClass: UnknownUserError, statusCode: 401 },
  { errorClass: NotFoundError, statusCode: 404 },
  { errorClass: DuplicateError, statusCode: 409 },
  { errorClass: SeatsUnavailableError, statusCode: 409 },
];

const isClientError = (error: Error): boolean => {
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode >= 400 && error.statusCode < 500;
  }

  return false;
};

const errorHandler: FastifyPluginAsyncTypebox = async (app: AppInstance): Promise<void> => {
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply): never => {
    if (error instanceof DomainError) {
      const errorStatusMapping: ErrorStatusMapping | undefined = errorStatusMappings.find(
        (item: ErrorStatusMapping) => error instanceof item.errorClass,
      );

      if (errorStatusMapping) {
        // Fastify keeps an explicitly set status when the error is rethrown
        reply.status(errorStatusMapping.statusCode);
        throw error;
      }

      request.log.error({ err: error }, 'DomainError without status mapping');
    } else if (isClientError(error)) {
      throw error;
    } else {
      request.log.error({ err: error }, 'Unexpected error');
    }

    // 5xx messages may contain SQL and its params, so the client gets a generic error
    throw request.server.httpErrors.internalServerError();
  });
};

export const errorHandlerPlugin: FastifyPluginAsyncTypebox = fp(errorHandler);
