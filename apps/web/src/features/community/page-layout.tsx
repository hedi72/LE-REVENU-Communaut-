import type { Community } from '@/lib/community-types';
import type { Category } from '@/lib/types';
import { getCategories, getCommunity } from '@/lib/strapi';
import { getSession } from '@/lib/session';
import { Sidebar } from '@/components/shell';
export async function communityPageData() {
  const [{ data: categories }, { data: community }, session] = await Promise.all([
    getCategories(),
    getCommunity(),
    getSession(),
  ]);
  return { categories, community, session };
}
export function CommunityPageLayout({
  categories,
  community,
  active,
  children,
  right,
}: {
  categories: Category[];
  community: Community;
  active?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="wrap">
      <div className={`layout ${right ? '' : 'no-right'}`}>
        <Sidebar categories={categories} community={community} active={active} />
        <main className="main" id="contenu">
          {children}
        </main>
        {right && <aside className="right">{right}</aside>}
      </div>
    </div>
  );
}
