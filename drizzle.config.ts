import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
