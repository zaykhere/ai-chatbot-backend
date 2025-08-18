import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  schema: './src/db',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DEV_DB!,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
});