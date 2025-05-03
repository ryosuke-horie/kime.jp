import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: '../../apps/workers/wrangler.toml',
    dbName: 'kime_mvp',
  },
} satisfies Config;