import { factories } from '@strapi/strapi';
import { authenticatedAuthor } from '../../../domain/validation';
export default factories.createCoreController('api::discussion.discussion', ({ strapi }) => ({
  async find(ctx) {
    ctx.body = await strapi.service('api::discussion.discussion').listPublic(ctx.query);
  },
  async findOne(ctx) {
    ctx.body = {
      data: await strapi.service('api::discussion.discussion').getPublic(ctx.params.id),
    };
  },
  async create(ctx) {
    const author = authenticatedAuthor(ctx.state.user);
    const data = await strapi
      .service('api::discussion.discussion')
      .publish(ctx.request.body?.data, author);
    ctx.status = 201;
    ctx.body = { data };
  },
}));
