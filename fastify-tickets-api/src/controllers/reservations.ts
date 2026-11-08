import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CreateReservationBody,
  CreateReservationService,
  ReservationResponse,
  ReservationResult,
} from '../common/types/index.js';

type PostReservationHandler = (
  request: FastifyRequest<{ Body: CreateReservationBody }>,
  reply: FastifyReply,
) => Promise<ReservationResponse>;

const toReservationResponse = (reservationResult: ReservationResult): ReservationResponse => {
  return {
    id: reservationResult.reservation.id,
    eventId: reservationResult.reservation.eventId,
    seatIds: reservationResult.seatIds,
    status: reservationResult.reservation.status,
    totalCents: reservationResult.totalCents,
    expiresAt: reservationResult.reservation.expiresAt.toISOString(),
    createdAt: reservationResult.reservation.createdAt.toISOString(),
  };
};

export const makePostReservation = (
  createReservation: CreateReservationService,
): PostReservationHandler => {
  return async (
    request: FastifyRequest<{ Body: CreateReservationBody }>,
    reply: FastifyReply,
  ): Promise<ReservationResponse> => {
    const { eventId, seatIds }: CreateReservationBody = request.body;
    const userId: string = request.user.sub;

    const reservationResult: ReservationResult = await createReservation({
      userId,
      eventId,
      seatIds,
    });

    reply.status(201);

    return toReservationResponse(reservationResult);
  };
};
