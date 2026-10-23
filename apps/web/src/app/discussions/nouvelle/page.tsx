import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCategories, getCommunity } from '@/lib/strapi';
import { referenceCategories } from '@/lib/design';
import { DiscussionForm } from '@/features/discussions/forms';
import { Icon } from '@/components/icon';
export const metadata = { title: 'Nouvelle publication' };
export default async function NewDiscussion() {
  if (!(await getSession())) redirect('/connexion');
  const [{ data: categories }, { data: community }] = await Promise.all([
    getCategories(),
    getCommunity(),
  ]);
  return (
    <main id="contenu" className="modal-page">
      <section className="modal">
        <div className="m-head">
          <h2>Nouvelle publication</h2>
          <Link href="/" className="icon-btn" aria-label="Fermer">
            <Icon name="x" />
          </Link>
        </div>
        <DiscussionForm categories={referenceCategories(categories, community)} />
      </section>
    </main>
  );
}
