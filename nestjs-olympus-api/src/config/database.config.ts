import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    url: required('DATABASE_URL'),
  }),
);
