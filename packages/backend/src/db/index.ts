import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import 'dotenv/config';
import { sql } from 'drizzle-orm';

// Singleton instance
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL!);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

export async function testDbConnection() {
  try {
    const db = getDb();

    // Light test query (doesn't touch your schema)
    const result = await db.execute(sql`SELECT 1 + 1 AS result`);

    console.log('✅ DB connected:');
  } catch (error) {
    console.error('❌ DB connection failed:', error);
    process.exit(1);
  }
}