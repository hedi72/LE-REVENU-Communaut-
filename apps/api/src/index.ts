import type { Core } from '@strapi/strapi';
import { configurePermissions, seedDemo } from './bootstrap/seed';
export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configurePermissions(strapi);
    await seedDemo(strapi);
  },
};
