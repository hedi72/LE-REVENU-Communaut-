import type { env as envHelper } from '@strapi/utils';
export interface ConfigContext {
  env: typeof envHelper;
}
