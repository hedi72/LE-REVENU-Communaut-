import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
export default async function Account() {
  const session = await getSession();
  if (!session) redirect('/connexion');
  redirect(`/membres/${encodeURIComponent(session.username)}`);
}
