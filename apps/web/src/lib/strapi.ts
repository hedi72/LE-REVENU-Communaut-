import 'server-only';
import type { Community } from './community-types';
import type { Category, Collection, Discussion, Reply, Session } from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function strapi<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; token?: string } = {},
): Promise<T> {
  const base = process.env.STRAPI_URL || 'http://localhost:1337';
  let response: Response;
  try {
    response = await fetch(`${base}/api${path}`, {
      method: options.method || 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new ApiError(
      503,
      'Le service est temporairement indisponible. Réessayez dans un instant.',
    );
  }
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: 'Vérifiez les informations saisies.',
      401: 'Connectez-vous pour continuer.',
      403: 'Vous n’êtes pas autorisé à effectuer cette action.',
      404: 'Cette ressource est introuvable.',
      429: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
    };
    throw new ApiError(
      response.status,
      messages[response.status] || 'Une erreur est survenue. Réessayez plus tard.',
    );
  }
  return response.json() as Promise<T>;
}

export const getCategories = () => strapi<{ data: Category[] }>('/categories');
export const getCommunity = () => strapi<{ data: Community }>('/community');
export const getDiscussion = (id: string) =>
  strapi<{ data: Discussion }>(`/discussions/${encodeURIComponent(id)}`);
export const getDiscussions = (params: URLSearchParams) =>
  strapi<Collection<Discussion>>(`/discussions?${params}`);
export const getReplies = (id: string, page: string) =>
  strapi<Collection<Reply>>(`/replies?${new URLSearchParams({ discussion: id, page })}`);
export const getCurrentUser = (token: string) => strapi<Session>('/users/me', { token });
