import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const databaseUrl: string | undefined = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

export const pool: Pool = new Pool({ connectionString: databaseUrl });

export const db: NodePgDatabase = drizzle(pool);
