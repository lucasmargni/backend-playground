import { and, asc, count, eq, gte, lte, type SQL } from 'drizzle-orm';

import { NotFoundError } from '../common/errors/index.js';
import type {
  EventDB,
  EventDetailsResult,
  EventFilters,
  EventSearchResult,
  Pagination,
} from '../common/types/index.js';
import { db } from '../db/index.js';
import { events, seats } from '../db/schema.js';

type Count = { count: number };

export const findEvents = async (
  filters: EventFilters,
  pagination: Pagination,
): Promise<EventSearchResult> => {
  const condition: SQL | undefined = and(
    filters.from !== undefined ? gte(events.startsAt, filters.from) : undefined,
    filters.to !== undefined ? lte(events.startsAt, filters.to) : undefined,
    filters.minPriceCents !== undefined ? gte(events.priceCents, filters.minPriceCents) : undefined,
    filters.maxPriceCents !== undefined ? lte(events.priceCents, filters.maxPriceCents) : undefined,
  );

  const [rows, [countRow]]: [EventDB[], Count[]] = await Promise.all([
    db
      .select()
      .from(events)
      .where(condition)
      .orderBy(asc(events.startsAt), asc(events.id))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ count: count() }).from(events).where(condition),
  ]);

  if (!countRow) {
    throw new Error('COUNT returned no rows');
  }

  return { data: rows, total: countRow.count };
};

export const findEventDetails = async (eventId: string): Promise<EventDetailsResult> => {
  const event: EventDB = await findEvent(eventId);

  const [countRow]: Count[] = await db
    .select({ count: count() })
    .from(seats)
    .where(and(eq(seats.eventId, eventId), eq(seats.status, 'available')));

  if (!countRow) {
    throw new Error('COUNT returned no rows');
  }

  return { event, availableSeats: countRow.count };
};

export const findEvent = async (eventId: string): Promise<EventDB> => {
  const [event]: EventDB[] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (!event) {
    throw new NotFoundError('Event', eventId);
  }

  return event;
};
