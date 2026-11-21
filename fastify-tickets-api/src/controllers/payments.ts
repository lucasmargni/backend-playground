import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  FinalOrder,
  FinalOrderStatus,
  IdempotencyKeyHeaders,
  OrderResponse,
  PayReservationInput,
  ReservationParams,
} from '../common/types/index.js';
import { payReservation } from '../services/payments.js';

const ORDER_STATUS_CODES: Record<FinalOrderStatus, 201 | 402> = { paid: 201, failed: 402 };

const toOrderResponse = (order: FinalOrder): OrderResponse => {
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

  const order: FinalOrder = await payReservation(input);

  reply.status(ORDER_STATUS_CODES[order.status]);

  return toOrderResponse(order);
};
