import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
export default async function Activity() {
  const data = await communityPageData();
  return (
    <CommunityPageLayout {...data}>
      <header className="page-head">
        <h1>Votre activité</h1>
        <p>Retrouvez les nouvelles de la communauté.</p>
      </header>
      <section className="card empty">
        <h3>Aucune notification pour l’instant.</h3>
        <p>Participez à une discussion pour commencer les échanges.</p>
      </section>
    </CommunityPageLayout>
  );
}
