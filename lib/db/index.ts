import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

let db: ReturnType<typeof drizzle>;

function createDatabase() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('Missing required database environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
    throw new Error('Database configuration is incomplete');
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return drizzle(client, { schema });
}

// Initialize database connection
try {
  db = createDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  // Create a fallback that will throw on use
  db = new Proxy({} as any, {
    get() {
      throw new Error('Database is not properly configured');
    }
  });
}

export { db };
