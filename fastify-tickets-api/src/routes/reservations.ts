import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { makePostReservation } from '../controllers/reservations.js';
import { authenticate } from '../plugins/jwt.js';
import { CreateReservationBodySchema, ReservationSchema } from '../schemas/reservations.js';
import { createReservation } from '../services/reservations.js';

export const reservationsRoutes: FastifyPluginAsyncTypebox = async (
  app: AppInstance,
): Promise<void> => {
  app.addHook('onRequest', authenticate);

  app.post(
    '/',
    {
      schema: { body: CreateReservationBodySchema, response: { 201: ReservationSchema } },
    },
    makePostReservation(createReservation),
  );
};
