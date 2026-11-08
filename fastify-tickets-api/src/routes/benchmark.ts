import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { makePostReservation } from '../controllers/reservations.js';
import { authenticate } from '../plugins/jwt.js';
import { CreateReservationBodySchema, ReservationSchema } from '../schemas/reservations.js';
import { createNaiveReservation } from '../services/reservations-naive.js';

export const benchmarkRoutes: FastifyPluginAsyncTypebox = async (
  app: AppInstance,
): Promise<void> => {
  app.addHook('onRequest', authenticate);

  app.post(
    '/naive',
    { schema: { body: CreateReservationBodySchema, response: { 201: ReservationSchema } } },
    makePostReservation(createNaiveReservation),
  );
};
