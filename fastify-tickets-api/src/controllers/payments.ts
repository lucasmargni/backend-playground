import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  IdempotencyKeyHeaders,
  OrderDB,
  OrderResponse,
  PayReservationInput,
  ReservationParams,
} from '../common/types/index.js';
import { payReservation } from '../services/payments.js';

const toOrderResponse = (order: OrderDB): OrderResponse => {
  return {
    id: order.id,
    reservationId: order.reservationId,
    status: order.status,
    amountCents: order.amountCents,
    createdAt: order.createdAt.toISOString(),
  };
};

export const postReservationPayment = async (
  request: FastifyRequest<{ Params: ReservationParams; Headers: IdempotencyKeyHeaders }>,
  reply: FastifyReply,
): Promise<OrderResponse> => {
  const input: PayReservationInput = {
    userId: request.user.sub,
    reservationId: request.params.reservationId,
    idempotencyKey: request.headers['idempotency-key'],
  };

  const order: OrderDB = await payReservation(input);

  if (order.status === 'pending') {
    throw new Error(
      `Order ${order.id} is still pending after payment completed, expected paid or failed`,
    );
  }

  reply.status(order.status === 'paid' ? 201 : 402);

  return toOrderResponse(order);
};
