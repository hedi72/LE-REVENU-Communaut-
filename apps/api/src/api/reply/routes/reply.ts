import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::reply.reply', {
  only: ['find', 'create'],
  config: { create: { policies: ['global::is-authenticated'] } },
});
