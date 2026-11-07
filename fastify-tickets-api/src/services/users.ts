import { hash, verify } from 'argon2';
import { eq } from 'drizzle-orm';

import {
  DuplicateError,
  InvalidCredentialsError,
  UnknownUserError,
} from '../common/errors/index.js';
import type { UserDB } from '../common/types/index.js';
import { isPostgresViolation, UNIQUE_VIOLATION, USERS_EMAIL_UNIQUE } from '../db/errors.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const DUMMY_HASH: string = await hash('timing-attack-dummy-password');

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
    if (isPostgresViolation(error, { code: UNIQUE_VIOLATION, constraint: USERS_EMAIL_UNIQUE })) {
      throw new DuplicateError('User', 'email');
    }

    throw error;
  }
};

export const verifyCredentials = async (email: string, password: string): Promise<UserDB> => {
  const normalizedEmail: string = normalizeEmail(email);

  const [user]: UserDB[] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  // if the user does not exist, verify executes anyway to prevent timing attack
  const isVerified: boolean = await verify(user?.password ?? DUMMY_HASH, password);

  if (!user || !isVerified) {
    throw new InvalidCredentialsError();
  }

  return user;
};

export const findAuthenticatedUser = async (userId: string): Promise<UserDB> => {
  const [user]: UserDB[] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new UnknownUserError();
  }

  return user;
};
