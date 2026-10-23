import Link from 'next/link';
import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
import { SpaceIcon } from '@/components/shell';
import { referenceCategories, formatNumber } from '@/lib/design';
export default async function Spaces() {
  const data = await communityPageData();
  return (
    <CommunityPageLayout {...data} active="/espaces">
      <header className="page-head">
        <h1>Tous les espaces</h1>
        <p>Onze espaces thématiques, calqués sur les grandes rubriques du Revenu.</p>
      </header>
      <div className="spaces-grid">
        {referenceCategories(data.categories, data.community).map((category) => (
          <Link className="space" href={`/?category=${category.slug}`} key={category.documentId}>
            <SpaceIcon icon={category.icon} color={category.color} size="md" />
            <h3>{category.name}</h3>
            <p>{category.desc}</p>
            <small>
              <span className="num">{category.topics}</span> discussions ·{' '}
              <span className="num">{formatNumber(category.posts)}</span> réponses
            </small>
          </Link>
        ))}
      </div>
    </CommunityPageLayout>
  );
}
