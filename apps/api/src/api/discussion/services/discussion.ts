import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { discussionInput, optionalQuery, pageNumber } from '../../../domain/validation';
import {
  discussionPopulate,
  pagination,
  presentDiscussion,
  type DiscussionRecord,
} from '../../../domain/presentation';
export default factories.createCoreService('api::discussion.discussion', ({ strapi }) => ({
  async listPublic(query: Record<string, unknown>) {
    const page = pageNumber(query.page);
    const category = optionalQuery(query.category);
    const q = optionalQuery(query.q);
    if (query.sort !== undefined && !['oldest', 'newest', 'trending'].includes(String(query.sort)))
      throw new errors.ValidationError('Tri invalide.');
    const filters = {
      ...(query.unanswered === 'true' ? { replies: { id: { $null: true } } } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(q ? { $or: [{ title: { $containsi: q } }, { content: { $containsi: q } }] } : {}),
    };
    const [records, total] = await Promise.all([
      strapi.documents('api::discussion.discussion').findMany({
        filters,
        sort:
          query.sort === 'trending'
            ? [{ trendRank: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }]
            : [{ createdAt: query.sort === 'oldest' ? 'asc' : 'desc' }, { id: 'asc' }],
        start: (page - 1) * 20,
        limit: 20,
        populate: discussionPopulate,
      }),
      strapi.documents('api::discussion.discussion').count({ filters }),
    ]);
    return {
      data: (records as unknown as DiscussionRecord[]).map(presentDiscussion),
      meta: { pagination: pagination(page, total, 20) },
    };
  },
  async getPublic(documentId: string) {
    const record = await strapi
      .documents('api::discussion.discussion')
      .findOne({ documentId, populate: discussionPopulate });
    if (!record) throw new errors.NotFoundError('Discussion introuvable.');
    return presentDiscussion(record as unknown as DiscussionRecord);
  },
  async publish(input: unknown, author: number) {
    const data = discussionInput(input);
    const category = await strapi
      .documents('api::category.category')
      .findOne({ documentId: data.category });
    if (!category)
      throw new errors.ValidationError('Catégorie introuvable.', { field: 'category' });
    const record = await strapi.documents('api::discussion.discussion').create({
      data: { ...data, author },
      populate: discussionPopulate,
    });
    return presentDiscussion(record as unknown as DiscussionRecord);
  },
}));
