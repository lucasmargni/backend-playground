import { Type } from 'typebox';

export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
});

export const UserCredentialsSchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 254 }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
});
