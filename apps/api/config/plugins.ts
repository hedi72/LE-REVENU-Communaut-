import type { ConfigContext } from './types';
export default ({ env }: ConfigContext) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
      jwt: { expiresIn: '1d' },
      register: { allowedFields: [] },
    },
  },
});
