import type { FastifyRequest } from 'fastify';

import type {
  EventParams,
  EventSeatsResponse,
  SeatDB,
  SeatResponse,
} from '../common/types/index.js';
import { findEventSeats } from '../services/seats.js';

const toSeatResponse = (seat: SeatDB): SeatResponse => {
  return {
    id: seat.id,
    row: seat.row,
    number: seat.number,
    status: seat.status,
  };
};

export const getEventSeats = async (
  request: FastifyRequest<{ Params: EventParams }>,
): Promise<EventSeatsResponse> => {
  const { eventId }: EventParams = request.params;

  const eventSeats: SeatDB[] = await findEventSeats(eventId);

  return { seats: eventSeats.map(toSeatResponse), eventId };
};
