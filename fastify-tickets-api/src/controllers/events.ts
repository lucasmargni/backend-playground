import type { EventDB, EventResponse } from '../common/types/index.js';
import { findEvents } from '../services/events.js';

const toEventResponse = (event: EventDB): EventResponse => {
  return {
    id: event.id,
    name: event.name,
    startsAt: event.startsAt.toISOString(),
    priceCents: event.priceCents,
  };
};

export const getEvents = async (): Promise<EventResponse[]> => {
  const events: EventDB[] = await findEvents();

  return events.map(toEventResponse);
};
