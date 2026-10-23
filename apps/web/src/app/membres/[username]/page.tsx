import { notFound } from 'next/navigation';
import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
import { Avatar } from '@/components/ui';
import { levelName, profileFor } from '@/lib/design';
import { ProgressCard } from '@/components/shell';
export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await communityPageData();
  let profile = profileFor(decodeURIComponent(username), data.community);
  if (!profile && data.session?.username === decodeURIComponent(username))
    profile = {
      username: data.session.username,
      name: data.session.username,
      color: 'var(--av-1)',
      points: 0,
      month: 0,
      role: 'member',
      sub: false,
      bio: '',
      badges: [],
    };
  if (!profile) notFound();
  return (
    <CommunityPageLayout {...data}>
      <section className="card">
        <div className="author">
          <Avatar name={profile.name} size="xl" profile={profile} />
          <div>
            <h1 className="section-title">{profile.name}</h1>
            <p className="muted">
              {levelName(profile.points)} · {profile.points} points
            </p>
            {profile.bio && <p style={{ marginTop: 12 }}>{profile.bio}</p>}
          </div>
        </div>
      </section>
      <ProgressCard session={{ username: profile.name, email: '' }} community={data.community} />
      <section className="card">
        <h2 className="section-title">À propos</h2>
        <p className="muted" style={{ marginTop: 12 }}>
          Membre de la communauté des lecteurs du Revenu.
        </p>
      </section>
    </CommunityPageLayout>
  );
}
