import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

export const FOREIGN_KEY_VIOLATION: string = '23503';
export const UNIQUE_VIOLATION: string = '23505';

export const hasPostgresErrorCode = (error: unknown, code: string): boolean => {
  return (
    error instanceof DrizzleQueryError &&
    error.cause instanceof DatabaseError &&
    error.cause.code === code
  );
};
