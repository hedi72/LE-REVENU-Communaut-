import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCategories, getCommunity } from '@/lib/strapi';
import { referenceCategories } from '@/lib/design';
import { Dialog } from '@/components/dialog';
import { DiscussionForm } from '@/features/discussions/forms';
export default async function NewDiscussionModal() {
  if (!(await getSession())) redirect('/connexion');
  const [{ data: categories }, { data: community }] = await Promise.all([
    getCategories(),
    getCommunity(),
  ]);
  return (
    <Dialog title="Nouvelle publication">
      <DiscussionForm categories={referenceCategories(categories, community)} />
    </Dialog>
  );
}
