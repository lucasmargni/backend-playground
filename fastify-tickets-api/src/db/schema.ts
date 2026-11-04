import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const seatStatus = pgEnum('seat_status', ['available', 'held', 'sold']);

export const reservationStatus = pgEnum('reservation_status', [
  'pending',
  'confirmed',
  'expired',
  'cancelled',
]);

export const orderStatus = pgEnum('order_status', ['pending', 'paid', 'failed']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    priceCents: integer('price_cents').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check('events_price_cents_positive', sql`${table.priceCents} > 0`)],
);

export const seats = pgTable(
  'seats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id),
    row: text('row').notNull(),
    number: integer('number').notNull(),
    status: seatStatus('status').notNull().default('available'),
  },
  (table) => [
    unique().on(table.eventId, table.row, table.number),
    check('seats_number_positive', sql`${table.number} > 0`),
  ],
);

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  status: reservationStatus('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const reservationSeats = pgTable(
  'reservation_seats',
  {
    reservationId: uuid('reservation_id')
      .notNull()
      .references(() => reservations.id),
    seatId: uuid('seat_id')
      .notNull()
      .references(() => seats.id),
  },
  (table) => [primaryKey({ columns: [table.reservationId, table.seatId] })],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservationId: uuid('reservation_id')
      .notNull()
      .unique()
      .references(() => reservations.id),
    amountCents: integer('amount_cents').notNull(),
    status: orderStatus('status').notNull().default('pending'),
    idempotencyKey: uuid('idempotency_key').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check('orders_amount_cents_positive', sql`${table.amountCents} > 0`)],
);
