import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { RouteShorthandOptions } from 'fastify';

import type { AppInstance } from '../common/types/index.js';
import { makePostReservation } from '../controllers/reservations.js';
import { authenticate } from '../plugins/jwt.js';
import { CreateReservationBodySchema, ReservationSchema } from '../schemas/reservations.js';
import { createNaiveReservation } from '../services/reservations-naive.js';
import { createOptimisticReservation } from '../services/reservations-optimistic.js';
import { createPessimisticReservation } from '../services/reservations-pessimistic.js';

const reservationRouteOptions = {
  schema: { body: CreateReservationBodySchema, response: { 201: ReservationSchema } },
} satisfies RouteShorthandOptions;

export const benchmarkRoutes: FastifyPluginAsyncTypebox = async (
  app: AppInstance,
): Promise<void> => {
  app.addHook('onRequest', authenticate);

  app.post('/naive', reservationRouteOptions, makePostReservation(createNaiveReservation));

  app.post(
    '/pessimistic',
    reservationRouteOptions,
    makePostReservation(createPessimisticReservation),
  );

  app.post(
    '/optimistic',
    reservationRouteOptions,
    makePostReservation(createOptimisticReservation),
  );
};
