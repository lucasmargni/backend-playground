import type { seats } from '../../db/schema.js';

export type HealthResponse = {
  status: string;
};

export type NewSeat = typeof seats.$inferInsert;
