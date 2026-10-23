export interface Category {
  documentId: string;
  name: string;
  slug: string;
  description: string;
}
export interface Author {
  username: string;
}
export interface Discussion {
  referenceKey?: string | null;
  presentation?: import('./community-types').DiscussionPresentation | null;
  documentId: string;
  title: string;
  content: string;
  type: 'question' | 'discussion';
  createdAt: string;
  author: Author;
  category: Category | null;
  replyCount: number;
}
export interface Reply {
  documentId: string;
  content: string;
  createdAt: string;
  author: Author;
}
export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
export interface Collection<T> {
  data: T[];
  meta: { pagination: Pagination };
}
export interface Session {
  username: string;
  email: string;
}
export interface FormState {
  error?: string;
  values?: Record<string, string>;
}
