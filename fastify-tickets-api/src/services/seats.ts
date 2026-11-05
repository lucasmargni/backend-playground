import { asc, eq } from 'drizzle-orm';

import type { SeatDB } from '../common/types/db.js';
import { db } from '../db/index.js';
import { seats } from '../db/schema.js';
import { findEvent } from './events.js';

export const findEventSeats = async (eventId: string): Promise<SeatDB[]> => {
  await findEvent(eventId);

  return db
    .select()
    .from(seats)
    .where(eq(seats.eventId, eventId))
    .orderBy(asc(seats.row), asc(seats.number));
};
