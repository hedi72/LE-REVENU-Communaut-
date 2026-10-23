import { errors } from '@strapi/utils';
const { ValidationError, UnauthorizedError } = errors;

export function authenticatedAuthor(user: { id: number } | null | undefined): number {
  if (!user?.id) throw new UnauthorizedError('Connectez-vous pour publier.');
  return user.id;
}

function object(input: unknown, allowed: string[]): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new ValidationError('Données invalides.');
  const data = input as Record<string, unknown>;
  if (Object.keys(data).some((key) => !allowed.includes(key))) {
    throw new ValidationError('Champ non autorisé. L’auteur est déterminé par la session.');
  }
  return data;
}

function text(value: unknown, field: string, min = 1, max = 20000): string {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new ValidationError(`${field} : entre ${min} et ${max} caractères.`, { field });
  }
  return value.trim();
}

export function discussionInput(input: unknown): {
  title: string;
  content: string;
  category: string;
  type: 'question' | 'discussion';
} {
  const data = object(input, ['title', 'content', 'category', 'type']);
  if (data.type !== 'question' && data.type !== 'discussion')
    throw new ValidationError('Type de publication invalide.', { field: 'type' });
  return {
    title: text(data.title, 'title', 10, 160),
    content: text(data.content, 'content'),
    category: text(data.category, 'category', 1, 100),
    type: data.type,
  };
}

export function replyInput(input: unknown) {
  const data = object(input, ['content', 'discussion']);
  return {
    content: text(data.content, 'content'),
    discussion: text(data.discussion, 'discussion', 1, 100),
  };
}

export function pageNumber(value: unknown): number {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d{0,5}$/.test(value))
    throw new ValidationError('Page invalide.');
  return Number(value);
}

export function optionalQuery(value: unknown): string | undefined {
  if (value === undefined || value === '') return undefined;
  return text(value, 'query', 1, 100);
}
