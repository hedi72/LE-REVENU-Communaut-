import type { ConfigContext } from './types';
export default ({ env }: ConfigContext) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'lerevenu'),
      user: env('DATABASE_USERNAME', 'lerevenu'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false) && { rejectUnauthorized: true },
    },
    pool: { min: 0, max: 10 },
    acquireConnectionTimeout: 60000,
  },
});
