import type { Static } from 'typebox';

import type { EventSeatsSchema, SeatSchema } from '../../schemas/seats.js';

export type SeatResponse = Static<typeof SeatSchema>;

export type EventSeatsResponse = Static<typeof EventSeatsSchema>;
