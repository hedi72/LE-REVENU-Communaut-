'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getToken } from '@/lib/session';
import { ApiError, strapi } from '@/lib/strapi';
import type { Discussion, FormState } from '@/lib/types';

export async function createDiscussion(_previous: FormState, form: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    ['title', 'content', 'category', 'type'].map((key) => [
      key,
      String(form.get(key) || '').trim(),
    ]),
  );
  if (values.title.length < 10 || values.title.length > 160)
    return { error: 'Le titre doit contenir entre 10 et 160 caractères.', values };
  if (
    !values.content ||
    values.content.length > 20000 ||
    !values.category ||
    !['question', 'discussion'].includes(values.type)
  )
    return { error: 'Renseignez le contenu, la catégorie et le type de publication.', values };
  const token = await getToken();
  if (!token) return { error: 'Connectez-vous pour publier.', values };
  let id: string;
  try {
    const result = await strapi<{ data: Discussion }>('/discussions', {
      method: 'POST',
      body: { data: values },
      token,
    });
    id = result.data.documentId;
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : 'La publication a échoué.',
      values,
    };
  }
  revalidatePath('/');
  redirect(`/discussions/${id}`);
}

export async function createReply(
  discussion: string,
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const content = String(form.get('content') || '').trim();
  if (!content || content.length > 20000)
    return { error: 'La réponse doit contenir entre 1 et 20 000 caractères.', values: { content } };
  const token = await getToken();
  if (!token) return { error: 'Connectez-vous pour répondre.', values: { content } };
  try {
    await strapi('/replies', { method: 'POST', body: { data: { content, discussion } }, token });
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : 'La réponse n’a pas été enregistrée.',
      values: { content },
    };
  }
  revalidatePath(`/discussions/${discussion}`);
  revalidatePath('/');
  redirect(`/discussions/${discussion}?replied=1#reponses`);
}
