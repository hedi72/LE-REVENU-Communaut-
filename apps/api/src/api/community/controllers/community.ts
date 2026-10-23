import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::community.community', ({ strapi }) => ({
  async find(ctx) {
    const record = await strapi.documents('api::community.community').findFirst();
    ctx.body = { data: record?.content || null };
  },
}));
