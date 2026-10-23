export interface PublicAuthor {
  id: number;
  username: string;
}
export interface CategoryRecord {
  documentId: string;
  name: string;
  slug: string;
  description?: string;
}
export interface DiscussionRecord {
  referenceKey?: string;
  presentation?: Record<string, unknown>;
  documentId: string;
  title: string;
  content: string;
  type: 'question' | 'discussion';
  createdAt: string;
  author: PublicAuthor | null;
  category: CategoryRecord | null;
  replies?: { count: number };
}
export interface ReplyRecord {
  documentId: string;
  content: string;
  createdAt: string;
  author: PublicAuthor | null;
}

export const authorPopulate = { fields: ['username' as const] };
export const discussionPopulate = {
  author: authorPopulate,
  category: { fields: ['name' as const, 'slug' as const, 'description' as const] },
  replies: { count: true },
};

// Explicit public DTOs: never serialize a full Users & Permissions user.
export function presentAuthor(author: PublicAuthor | null) {
  return author ? { username: author.username } : { username: 'Membre supprimé' };
}
export function presentCategory(category: CategoryRecord) {
  return {
    documentId: category.documentId,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  };
}
export function presentDiscussion(record: DiscussionRecord) {
  return {
    referenceKey: record.referenceKey || null,
    presentation: record.presentation || null,
    documentId: record.documentId,
    title: record.title,
    content: record.content,
    type: record.type,
    createdAt: record.createdAt,
    author: presentAuthor(record.author),
    category: record.category ? presentCategory(record.category) : null,
    replyCount: record.replies?.count || 0,
  };
}
export function presentReply(record: ReplyRecord) {
  return {
    documentId: record.documentId,
    content: record.content,
    createdAt: record.createdAt,
    author: presentAuthor(record.author),
  };
}
export function pagination(page: number, total: number, pageSize = 12) {
  return { page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
}
