import type { Static } from 'typebox';

import type { EventSeatsSchema, SeatSchema, SeatStatusSchema } from '../../schemas/seats.js';

export type SeatResponse = Static<typeof SeatSchema>;

export type SeatStatus = Static<typeof SeatStatusSchema>;

export type EventSeatsResponse = Static<typeof EventSeatsSchema>;
