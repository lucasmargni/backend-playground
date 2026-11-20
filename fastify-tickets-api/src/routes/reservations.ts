import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import type { AppInstance } from '../common/types/index.js';
import { postReservationPayment } from '../controllers/payments.js';
import { makePostReservation } from '../controllers/reservations.js';
import { authenticate } from '../plugins/jwt.js';
import { IdempotencyKeyHeadersSchema, OrderSchema } from '../schemas/orders.js';
import {
  CreateReservationBodySchema,
  ReservationParamsSchema,
  ReservationSchema,
} from '../schemas/reservations.js';
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

  app.post(
    '/:reservationId/payments',
    {
      schema: {
        params: ReservationParamsSchema,
        headers: IdempotencyKeyHeadersSchema,
        response: { 201: OrderSchema, 402: OrderSchema },
      },
    },
    postReservationPayment,
  );
};
