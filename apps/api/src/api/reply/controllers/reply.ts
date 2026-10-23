import { factories } from '@strapi/strapi';
import { authenticatedAuthor } from '../../../domain/validation';
export default factories.createCoreController('api::reply.reply', ({ strapi }) => ({
  async find(ctx) {
    ctx.body = await strapi.service('api::reply.reply').listPublic(ctx.query);
  },
  async create(ctx) {
    const author = authenticatedAuthor(ctx.state.user);
    ctx.body = {
      data: await strapi.service('api::reply.reply').publish(ctx.request.body?.data, author),
    };
    ctx.status = 201;
  },
}));
