import type { EventDB } from '../common/types/index.js';
import { db } from '../db/index.js';
import { events } from '../db/schema.js';

export const findEvents = async (): Promise<EventDB[]> => {
  return db.select().from(events);
};
