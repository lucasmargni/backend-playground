import type { ConnectionOptions } from 'bullmq';

const redisHost: string | undefined = process.env.REDIS_HOST;
const redisPortEnv: string | undefined = process.env.REDIS_PORT;

if (!redisHost) {
  throw new Error('REDIS_HOST is not defined');
}
if (!redisPortEnv) {
  throw new Error('REDIS_PORT is not defined');
}

const redisPort: number = Number(redisPortEnv);

if (!Number.isInteger(redisPort) || redisPort < 1 || redisPort > 65535) {
  throw new Error(`Invalid REDIS_PORT "${redisPortEnv}", expected an integer between 1 and 65535`);
}

export const redisConnection: ConnectionOptions = {
  host: redisHost,
  port: redisPort,
};
