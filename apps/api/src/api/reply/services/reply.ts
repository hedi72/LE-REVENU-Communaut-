import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { optionalQuery, pageNumber, replyInput } from '../../../domain/validation';
import {
  authorPopulate,
  pagination,
  presentReply,
  type ReplyRecord,
} from '../../../domain/presentation';
export default factories.createCoreService('api::reply.reply', ({ strapi }) => ({
  async listPublic(query: Record<string, unknown>) {
    const discussion = optionalQuery(query.discussion);
    if (!discussion) throw new errors.ValidationError('Discussion obligatoire.');
    const page = pageNumber(query.page);
    const filters = { discussion: { documentId: discussion } };
    const [records, total] = await Promise.all([
      strapi.documents('api::reply.reply').findMany({
        filters,
        sort: [{ createdAt: 'asc' }, { id: 'asc' }],
        start: (page - 1) * 12,
        limit: 12,
        populate: { author: authorPopulate },
      }),
      strapi.documents('api::reply.reply').count({ filters }),
    ]);
    return {
      data: (records as unknown as ReplyRecord[]).map(presentReply),
      meta: { pagination: pagination(page, total) },
    };
  },
  async publish(input: unknown, author: number) {
    const data = replyInput(input);
    const discussion = await strapi
      .documents('api::discussion.discussion')
      .findOne({ documentId: data.discussion });
    if (!discussion) throw new errors.NotFoundError('Discussion introuvable.');
    const record = await strapi
      .documents('api::reply.reply')
      .create({ data: { ...data, author }, populate: { author: authorPopulate } });
    return presentReply(record as unknown as ReplyRecord);
  },
}));
