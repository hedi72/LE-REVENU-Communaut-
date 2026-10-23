import 'server-only';
import { cookies } from 'next/headers';
import { ApiError, getCurrentUser } from './strapi';
export const SESSION_COOKIE = 'lr-session';
export async function getToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
export async function getSession() {
  const token = await getToken();
  if (!token) return null;
  try {
    return await getCurrentUser(token);
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) return null;
    throw error;
  }
}
