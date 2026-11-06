import { sql } from 'drizzle-orm';

import { db, pool } from './index.js';
import { events, orders, reservations, reservationSeats, seats, users } from './schema.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('db:reset cannot run in production');
}

try {
  // empties every table so each benchmark run starts from the same data
  await db.execute(
    sql`TRUNCATE ${orders}, ${reservationSeats}, ${reservations}, ${seats}, ${events}, ${users} CASCADE`,
  );
} finally {
  await pool.end();
}
