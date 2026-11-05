import type { Static } from 'typebox';

import type { UserSchema } from '../../schemas/users.js';

export type UserResponse = Static<typeof UserSchema>;
