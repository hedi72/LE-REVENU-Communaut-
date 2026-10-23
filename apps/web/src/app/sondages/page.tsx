import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
import { PollCard } from '@/features/community/editorial-widgets';
export default async function Polls() {
  const data = await communityPageData();
  return (
    <CommunityPageLayout {...data}>
      <header className="page-head">
        <h1>Les sondages de la communauté</h1>
        <p>Partagez votre avis et découvrez celui des lecteurs.</p>
      </header>
      {data.community.polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </CommunityPageLayout>
  );
}
