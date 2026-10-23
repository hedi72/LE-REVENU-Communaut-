'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError, strapi } from '@/lib/strapi';
import { SESSION_COOKIE } from '@/lib/session';
import type { FormState } from '@/lib/types';

export async function login(_previous: FormState, form: FormData): Promise<FormState> {
  const identifier = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (!identifier || !password)
    return {
      error: 'Renseignez votre adresse e-mail et votre mot de passe.',
      values: { email: identifier },
    };
  try {
    const result = await strapi<{ jwt: string }>('/auth/local', {
      method: 'POST',
      body: { identifier, password },
    });
    (await cookies()).set(SESSION_COOKIE, result.jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        process.env.SESSION_SECURE === 'true' ||
        (process.env.SESSION_SECURE !== 'false' && process.env.NODE_ENV === 'production'),
      path: '/',
      maxAge: 86400,
    });
  } catch (error) {
    return {
      error:
        error instanceof ApiError && [400, 401].includes(error.status)
          ? 'Adresse e-mail ou mot de passe incorrect.'
          : 'Connexion impossible pour le moment.',
      values: { email: identifier },
    };
  }
  redirect('/');
}
export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/');
}
