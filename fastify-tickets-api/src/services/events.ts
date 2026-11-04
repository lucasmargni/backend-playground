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

  const [rows, countRows]: [EventDB[], Count[]] = await Promise.all([
    db
      .select()
      .from(events)
      .where(condition)
      .orderBy(asc(events.startsAt), asc(events.id))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ count: count() }).from(events).where(condition),
  ]);

  return { data: rows, total: countRows[0]?.count ?? 0 };
};

export const findEvent = async (eventId: string): Promise<EventDetailsResult> => {
  const rows: EventDB[] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  const event: EventDB | undefined = rows[0];

  if (!event) {
    throw new NotFoundError('Event', eventId);
  }

  const countRows: Count[] = await db
    .select({ count: count() })
    .from(seats)
    .where(and(eq(seats.eventId, eventId), eq(seats.status, 'available')));

  return { event, availableSeats: countRows[0]?.count ?? 0 };
};
