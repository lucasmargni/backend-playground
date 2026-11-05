import { hash } from 'argon2';
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

import { ConflictError } from '../common/errors/index.js';
import type { UserDB } from '../common/types/index.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const UNIQUE_VIOLATION: string = '23505';

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const createUser = async (email: string, password: string): Promise<UserDB> => {
  const hashedPassword: string = await hash(password);
  const normalizedEmail: string = normalizeEmail(email);

  try {
    const [user]: UserDB[] = await db
      .insert(users)
      .values({ email: normalizedEmail, password: hashedPassword })
      .returning();

    if (!user) {
      throw new Error('User insert returned no rows');
    }

    return user;
  } catch (error: unknown) {
    if (
      error instanceof DrizzleQueryError &&
      error.cause instanceof DatabaseError &&
      error.cause.code === UNIQUE_VIOLATION
    ) {
      throw new ConflictError('User', 'email');
    }

    throw error;
  }
};
