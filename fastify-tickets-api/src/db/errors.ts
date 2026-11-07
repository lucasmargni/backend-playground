import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

import type { PostgresViolation } from '../common/types/index.js';

export const FOREIGN_KEY_VIOLATION: string = '23503';
export const UNIQUE_VIOLATION: string = '23505';

export const RESERVATIONS_USER_FK: string = 'reservations_user_id_users_id_fk';
export const USERS_EMAIL_UNIQUE: string = 'users_email_unique';

export const isPostgresViolation = (
  error: unknown,
  { code, constraint }: PostgresViolation,
): boolean => {
  return (
    error instanceof DrizzleQueryError &&
    error.cause instanceof DatabaseError &&
    error.cause.code === code &&
    (constraint === undefined || error.cause.constraint === constraint)
  );
};
