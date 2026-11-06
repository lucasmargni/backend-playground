export type EventItem = {
  id: string;
  priceCents: number;
};

export type SeatItem = {
  number: number;
  id: string;
  row: string;
  status: 'available' | 'held' | 'sold';
};

export type EventPage = {
  data: EventItem[];
  limit: number;
};

export type SeatList = {
  eventId: string;
  seats: SeatItem[];
};

export type TokenResponse = {
  token: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type ReservationBody = {
  eventId: string;
  seatIds: string[];
};

export type SetupData = {
  tokens: string[];
  eventId: string;
  seatIds: string[];
};

export type ScenarioName = 'same-seat' | 'random-seats';
