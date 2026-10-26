import 'server-only';
import { cache } from 'react';
import { createStrapiClient } from './strapi-client';
import type { Community } from './community-types';
import type { Category, Collection, Discussion, Reply, Session } from './types';

export { ApiError } from './strapi-client';

function readTimeout() {
  const configured = Number(process.env.STRAPI_READ_TIMEOUT_MS || '90000');
  return Number.isInteger(configured) && configured >= 1000 && configured <= 120000
    ? configured
    : 90000;
}

export async function strapi<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; token?: string } = {},
): Promise<T> {
  const request = createStrapiClient({
    baseUrl: process.env.STRAPI_URL || 'http://localhost:1337',
    readTimeoutMs: readTimeout(),
  });
  return request<T>(path, options);
}

// React cache only deduplicates within one server render, never across visitors.
export const getCategories = cache(() => strapi<{ data: Category[] }>('/categories'));
export const getCommunity = cache(() => strapi<{ data: Community }>('/community'));
export const getDiscussion = (id: string) =>
  strapi<{ data: Discussion }>(`/discussions/${encodeURIComponent(id)}`);
export const getDiscussions = (params: URLSearchParams) =>
  strapi<Collection<Discussion>>(`/discussions?${params}`);
export const getReplies = (id: string, page: string) =>
  strapi<Collection<Reply>>(`/replies?${new URLSearchParams({ discussion: id, page })}`);
export const getCurrentUser = cache((token: string) => strapi<Session>('/users/me', { token }));
