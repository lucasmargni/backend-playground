import type { FastifyRequest } from 'fastify';

import type {
  EventDB,
  EventFilters,
  EventPageResponse,
  EventQuery,
  EventResponse,
  EventSearchResult,
  Pagination,
} from '../common/types/index.js';
import { findEvents } from '../services/events.js';

const toEventResponse = (event: EventDB): EventResponse => {
  return {
    id: event.id,
    name: event.name,
    startsAt: event.startsAt.toISOString(),
    priceCents: event.priceCents,
  };
};

const isInvalidRange = (min: number | undefined, max: number | undefined): boolean => {
  return min !== undefined && max !== undefined && min > max;
};

export const getEvents = async (
  request: FastifyRequest<{ Querystring: EventQuery }>,
): Promise<EventPageResponse> => {
  const { from, to, minPriceCents, maxPriceCents, page, limit }: EventQuery = request.query;

  const fromDate: Date | undefined = from !== undefined ? new Date(from) : undefined;
  const toDate: Date | undefined = to !== undefined ? new Date(to) : undefined;

  if (isInvalidRange(minPriceCents, maxPriceCents)) {
    throw request.server.httpErrors.badRequest('maxPriceCents must not be less than minPriceCents');
  }
  if (isInvalidRange(fromDate?.getTime(), toDate?.getTime())) {
    throw request.server.httpErrors.badRequest('from must not be after to');
  }

  const filters: EventFilters = {
    from: fromDate,
    to: toDate,
    minPriceCents,
    maxPriceCents,
  };

  const pagination: Pagination = {
    limit,
    offset: (page - 1) * limit,
  };

  const { data, total }: EventSearchResult = await findEvents(filters, pagination);

  return { page, limit, data: data.map(toEventResponse), total };
};
