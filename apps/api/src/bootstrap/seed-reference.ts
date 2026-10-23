import type { Core } from '@strapi/strapi';
import reference from './fixtures/community.json';

/** Idempotent import. Existing contributions and accounts are preserved. */
export async function seedReference(strapi: Core.Strapi) {
  await strapi.db
    .query('api::discussion.discussion')
    .updateMany({ where: { trendRank: { $null: true } }, data: { trendRank: 0 } });
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });
  const authors = new Map<string, number>();
  for (const profile of reference.users) {
    const email = `demo-${profile.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}@example.com`;
    let user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email } });
    if (!user)
      user = await strapi.plugin('users-permissions').service('user').add({
        username: profile.name,
        email,
        password: process.env.DEMO_PASSWORD,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
    authors.set(profile.username, user.id);
  }
  const categories = new Map<string, string>();
  for (const entry of reference.categories) {
    let category = await strapi
      .documents('api::category.category')
      .findFirst({ filters: { slug: entry.slug } });
    if (category)
      category = await strapi.documents('api::category.category').update({
        documentId: category.documentId,
        data: { name: entry.name, description: entry.desc },
      });
    else
      category = await strapi
        .documents('api::category.category')
        .create({ data: { name: entry.name, slug: entry.slug, description: entry.desc } });
    if (!category) throw new Error(`Catégorie introuvable : ${entry.slug}`);
    categories.set(entry.slug, category.documentId);
  }
  for (const topic of reference.topics) {
    const referenceKey = `maquette-topic-${topic.id}`;
    const exists = await strapi
      .documents('api::discussion.discussion')
      .findFirst({ filters: { referenceKey } });
    if (exists) continue;
    const category = categories.get(topic.cat);
    const author = authors.get(topic.author);
    if (!category || !author) throw new Error(`Relation manquante pour ${referenceKey}`);
    const presentation = {
      pinned: topic.pinned || false,
      likes: topic.likes,
      views: topic.views,
      solved: Boolean(topic.solution),
      kind: topic.type,
      featured: ('featured' in topic ? topic.featured : null) ?? null,
      participants: [...new Set(topic.replies.map((reply) => reply.author))].slice(-4),
      options: ('options' in topic ? topic.options : null) ?? null,
    };
    const index = reference.topicOrder.indexOf(topic.id);
    const discussion = await strapi.documents('api::discussion.discussion').create({
      data: {
        title: topic.title,
        content: topic.body,
        type: topic.type === 'question' ? 'question' : 'discussion',
        category,
        author,
        referenceKey,
        trendRank: index < 0 ? 1 : 1000 - index,
        presentation,
        createdAt: new Date(Date.now() - topic.min * 60000).toISOString(),
      },
    });
    for (const reply of topic.replies) {
      const replyAuthor = authors.get(reply.author);
      if (!replyAuthor) throw new Error(`Auteur de réponse manquant : ${reply.author}`);
      await strapi.documents('api::reply.reply').create({
        data: {
          content: reply.body,
          author: replyAuthor,
          discussion: discussion.documentId,
          createdAt: new Date(Date.now() - (reply.min ?? topic.min) * 60000).toISOString(),
        },
      });
    }
  }
  const { topics, ...configuration } = reference;
  // Posts and replies are served through their normal REST resources.
  const content = {
    ...configuration,
    polls: topics
      .filter((topic) => 'options' in topic)
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        referenceKey: `maquette-topic-${topic.id}`,
        options: ('options' in topic ? topic.options : []) || [],
      })),
  };
  const existing = await strapi.documents('api::community.community').findFirst();
  if (!existing)
    await strapi
      .documents('api::community.community')
      .create({ data: { content: JSON.parse(JSON.stringify(content)) } });
}
