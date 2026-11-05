import type { Static } from 'typebox';

import type { UserCredentialsSchema, UserSchema } from '../../schemas/users.js';

export type UserResponse = Static<typeof UserSchema>;

export type UserCredentials = Static<typeof UserCredentialsSchema>;
