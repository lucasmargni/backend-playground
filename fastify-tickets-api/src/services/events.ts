import { and, asc, count, gte, lte, type SQL } from 'drizzle-orm';

import type {
  EventDB,
  EventFilters,
  EventSearchResult,
  Pagination,
} from '../common/types/index.js';
import { db } from '../db/index.js';
import { events } from '../db/schema.js';

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

  const [rows, countRows]: [EventDB[], { total: number }[]] = await Promise.all([
    db
      .select()
      .from(events)
      .where(condition)
      .orderBy(asc(events.startsAt), asc(events.id))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ total: count() }).from(events).where(condition),
  ]);

  return { data: rows, total: countRows[0]?.total ?? 0 };
};
