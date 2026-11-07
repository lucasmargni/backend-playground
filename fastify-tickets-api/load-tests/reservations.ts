import { check, fail } from 'k6';
import http, { type Params, type Response } from 'k6/http';
import { Counter } from 'k6/metrics';
import type { Options, Scenario } from 'k6/options';

import {
  BASE_URL,
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_OK,
  ITERATIONS_PER_VU,
  JSON_REQUEST_PARAMS,
  MAX_RANDOM_SEATS,
  MIN_RANDOM_SEATS,
  STRATEGY_NAMES,
  TOTAL_USERS,
  TOTAL_VIRTUAL_USERS,
  USER_EMAIL_DOMAIN,
  USER_EMAIL_PREFIX,
  USER_PASSWORD,
} from './constants.ts';
import type {
  EventItem,
  EventPage,
  LoginBody,
  ReservationBody,
  ScenarioName,
  SeatItem,
  SeatList,
  SetupData,
  StrategyName,
  TokenResponse,
} from './types.ts';

const isScenarioName = (value: string | undefined): value is ScenarioName => {
  return value !== undefined && Object.hasOwn(scenarioMap, value);
};

const isStrategyName = (value: string | undefined): value is StrategyName => {
  const strategyNames: readonly string[] = STRATEGY_NAMES;

  return value !== undefined && strategyNames.includes(value);
};

const expectStatus = (response: Response, expectedStatus: number, description: string): void => {
  if (response.status !== expectedStatus) {
    fail(
      `${description}: expected status ${expectedStatus}, got ${response.status}. Body: ${response.body}`,
    );
  }
};

const reserveSeats = (data: SetupData, seatIds: string[]): void => {
  const token: string | undefined = data.tokens[(__VU - 1) % data.tokens.length];

  if (!token) {
    fail(`No token found for VU ${__VU}`);
  }

  const params: Params = {
    headers: { ...JSON_REQUEST_PARAMS.headers, Authorization: `Bearer ${token}` },
  };

  const body: ReservationBody = { eventId: data.eventId, seatIds };
  const response: Response = http.post(
    `${BASE_URL}/benchmark/reservations/${strategyName}`,
    JSON.stringify(body),
    params,
  );

  check(response, {
    'status is 201 or 409': (r: Response): boolean =>
      r.status === HTTP_CREATED || r.status === HTTP_CONFLICT,
  });

  if (response.status === HTTP_CREATED) {
    reservationsCreated.add(1);
    seatsReserved.add(seatIds.length);
  }
};

const randomIntBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickRandomSeatIds = (seatIds: string[], count: number): string[] => {
  return [...seatIds].sort((): number => Math.random() - 0.5).slice(0, count);
};

const toUserEmail = (index: number): string => {
  return `${USER_EMAIL_PREFIX}${index}@${USER_EMAIL_DOMAIN}`;
};

const scenarioMap: Record<ScenarioName, Scenario> = {
  'same-seat': {
    executor: 'per-vu-iterations',
    vus: TOTAL_VIRTUAL_USERS,
    iterations: ITERATIONS_PER_VU,
    exec: 'sameSeat',
  },
  'random-seats': {
    executor: 'per-vu-iterations',
    vus: TOTAL_VIRTUAL_USERS,
    iterations: ITERATIONS_PER_VU,
    exec: 'randomSeats',
  },
};

const scenarioName: string | undefined = __ENV.SCENARIO;
const strategyName: string | undefined = __ENV.STRATEGY;

if (!isScenarioName(scenarioName)) {
  throw new Error(
    `Invalid SCENARIO ${scenarioName}, expected one of: ${Object.keys(scenarioMap).join(', ')}`,
  );
}

if (!isStrategyName(strategyName)) {
  throw new Error(
    `Invalid STRATEGY ${strategyName}, expected one of: ${STRATEGY_NAMES.join(', ')}`,
  );
}

const reservationsCreated: Counter = new Counter('reservations_created');
const seatsReserved: Counter = new Counter('seats_reserved');

export const options: Options = {
  scenarios: { [scenarioName]: scenarioMap[scenarioName] },
  thresholds: { checks: ['rate==1'] },
};

export const setup = (): SetupData => {
  const tokens: string[] = [];

  for (let i: number = 0; i < TOTAL_USERS; i++) {
    const email: string = toUserEmail(i);
    const body: LoginBody = { email, password: USER_PASSWORD };

    const registerResponse: Response = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify(body),
      JSON_REQUEST_PARAMS,
    );
    expectStatus(registerResponse, HTTP_CREATED, `Register of ${email} failed`);

    const loginResponse: Response = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify(body),
      JSON_REQUEST_PARAMS,
    );
    expectStatus(loginResponse, HTTP_OK, `Login of ${email} failed`);

    const token: unknown = (loginResponse.json() as TokenResponse).token;

    if (typeof token !== 'string' || token.length === 0) {
      fail(`Token of ${email} not valid`);
    }

    tokens.push(token);
  }

  const eventsResponse: Response = http.get(`${BASE_URL}/events`);
  expectStatus(eventsResponse, HTTP_OK, 'Events lookup failed');

  const [event]: EventItem[] = (eventsResponse.json() as EventPage).data;

  if (!event) {
    fail('No events found, run npm run db:reset first');
  }

  const seatsResponse: Response = http.get(`${BASE_URL}/events/${event.id}/seats`);
  expectStatus(seatsResponse, HTTP_OK, 'Seats lookup failed');

  const seats: SeatItem[] = (seatsResponse.json() as SeatList).seats;

  if (seats.length === 0) {
    fail('No seats found in the event, run npm run db:reset first');
  }

  if (seats.some((seat: SeatItem): boolean => seat.status !== 'available')) {
    fail('All seats must have status "available", run npm run db:reset first');
  }

  const seatIds: string[] = seats.map((seat: SeatItem): string => seat.id);

  return { tokens, eventId: event.id, seatIds };
};

export const sameSeat = (data: SetupData): void => {
  const firstSeatId: string | undefined = data.seatIds[0];

  if (!firstSeatId) {
    fail(`Event ${data.eventId} has no seats`);
  }

  reserveSeats(data, [firstSeatId]);
};

export const randomSeats = (data: SetupData): void => {
  const seatCount: number = randomIntBetween(MIN_RANDOM_SEATS, MAX_RANDOM_SEATS);

  const randomSeatIds: string[] = pickRandomSeatIds(data.seatIds, seatCount);

  reserveSeats(data, randomSeatIds);
};
