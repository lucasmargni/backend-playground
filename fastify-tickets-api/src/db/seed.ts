import type { NewSeat } from '../common/types/index.js';
import { db, pool } from './index.js';
import { events, seats } from './schema.js';

const thirtyDaysInMs: number = 30 * 24 * 60 * 60 * 1000;
const startsAt: Date = new Date(Date.now() + thirtyDaysInMs);
const rows: string[] = ['A', 'B', 'C', 'D', 'E'];
const seatsPerRow: number = 10;

try {
  const [event] = await db
    .insert(events)
    .values({ name: 'firstEvent', priceCents: 20000, startsAt })
    .returning();

  if (!event) {
    throw new Error('Event could not be created');
  }

  const newSeats: NewSeat[] = [];

  for (const row of rows) {
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      newSeats.push({
        eventId: event.id,
        label: `${row}${seatNum}`,
      });
    }
  }

  await db.insert(seats).values(newSeats);
} finally {
  await pool.end();
}
