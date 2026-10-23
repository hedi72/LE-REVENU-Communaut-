import { factories } from '@strapi/strapi';
import { presentCategory, type CategoryRecord } from '../../../domain/presentation';
export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  async find(ctx) {
    const records = await strapi
      .documents('api::category.category')
      .findMany({ sort: ['name:asc'], limit: 100 });
    ctx.body = { data: (records as unknown as CategoryRecord[]).map(presentCategory) };
  },
}));
