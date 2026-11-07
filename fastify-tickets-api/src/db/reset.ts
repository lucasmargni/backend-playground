import { sql } from 'drizzle-orm';

import { db, pool } from './index.js';
import { events, orders, reservations, reservationSeats, seats, users } from './schema.js';

const LOCAL_DATABASE_HOSTNAMES: readonly string[] = ['localhost', '127.0.0.1'];

if (process.env.NODE_ENV === 'production') {
  throw new Error('db:reset cannot run in production');
}

const databaseUrl: string | undefined = process.env.DATABASE_URL;

if (databaseUrl === undefined) {
  throw new Error('DATABASE_URL not defined in .env');
}

const databaseUrlHostname: string = new URL(databaseUrl).hostname;

if (!LOCAL_DATABASE_HOSTNAMES.includes(databaseUrlHostname)) {
  throw new Error(
    `DATABASE_URL hostname "${databaseUrlHostname}" is not allowed for db:reset, valid hostnames: ${LOCAL_DATABASE_HOSTNAMES.join(', ')}`,
  );
}

try {
  // empties every table so each benchmark run starts from the same data
  await db.execute(
    sql`TRUNCATE ${orders}, ${reservationSeats}, ${reservations}, ${seats}, ${events}, ${users} CASCADE`,
  );
} finally {
  await pool.end();
}
