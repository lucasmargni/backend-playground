import { Type } from 'typebox';

const EmailSchema = Type.String({ format: 'email', maxLength: 254 });

export const TokenSchema = Type.Object({
  token: Type.String(),
});

export const RegisterBodySchema = Type.Object({
  email: EmailSchema,
  password: Type.String({ minLength: 8, maxLength: 128 }),
});

export const LoginBodySchema = Type.Object({
  email: EmailSchema,
  password: Type.String({ minLength: 1, maxLength: 128 }),
});
