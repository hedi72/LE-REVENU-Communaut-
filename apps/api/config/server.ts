import type { ConfigContext } from './types';
export default ({ env }: ConfigContext) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', ''),
  app: { keys: env.array('APP_KEYS') },
});
