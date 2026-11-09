import type { Params } from 'k6/http';

export const BASE_URL: string = __ENV.BASE_URL ?? 'http://localhost:3000';
export const TOTAL_USERS: number = 25;
export const USER_EMAIL_PREFIX: string = 'load-user';
export const USER_EMAIL_DOMAIN: string = 'test.com';
export const USER_PASSWORD: string = 'super-secret-pass';
export const TOTAL_VIRTUAL_USERS: number = 100;
export const MIN_RANDOM_SEATS: number = 1;
export const MAX_RANDOM_SEATS: number = 3;
export const JSON_REQUEST_PARAMS: Params = { headers: { 'Content-Type': 'application/json' } };
export const ITERATIONS_PER_VU: number = 1;

export const HTTP_OK: number = 200;
export const HTTP_CREATED: number = 201;
export const HTTP_CONFLICT: number = 409;

export const RESERVATION_REQUEST_NAME: string = 'reservation';
export const DISPLAY_ONLY_THRESHOLD: string = 'max>=0';

export const STRATEGY_NAMES = ['naive', 'pessimistic', 'optimistic', 'constraint'] as const;
