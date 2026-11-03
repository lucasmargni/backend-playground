import type { Static } from 'typebox';

import type { EventPageSchema, EventQuerySchema, EventSchema } from '../../schemas/events.js';
import type { EventDB } from './db.js';

export type EventResponse = Static<typeof EventSchema>;

export type EventPageResponse = Static<typeof EventPageSchema>;

export type EventQuery = Static<typeof EventQuerySchema>;

export type EventFilters = {
  from?: Date;
  to?: Date;
  minPriceCents?: number;
  maxPriceCents?: number;
};

export type EventSearchResult = {
  data: EventDB[];
  total: number;
};
