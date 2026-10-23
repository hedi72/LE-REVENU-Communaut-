import Link from 'next/link';
import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
import { Avatar } from '@/components/ui';
import { Icon } from '@/components/icon';
import { levelName } from '@/lib/design';
export default async function Leaderboard() {
  const data = await communityPageData();
  const members = data.community.users
    .filter((user) => user.role === 'member')
    .sort((a, b) => b.month - a.month);
  return (
    <CommunityPageLayout
      {...data}
      active="/classement"
      right={
        <section className="card">
          <h2 className="card-title">Gagner des points</h2>
          <ul className="plist">
            <li>
              <span>Publier une réponse</span>
              <b>+3</b>
            </li>
            <li>
              <span>Lancer une discussion</span>
              <b>+5</b>
            </li>
            <li>
              <span>Recevoir un « Utile »</span>
              <b>+5</b>
            </li>
          </ul>
        </section>
      }
    >
      <header className="page-head">
        <h1>Classement des contributeurs</h1>
        <p>
          Les membres qui font vivre la communauté. Aidez les autres, gagnez des points, montez de
          niveau.
        </p>
      </header>
      <section className="card">
        <h2 className="card-title">
          <Icon name="trophy" />
          Ce mois-ci
        </h2>
        {members.map((member, index) => (
          <div className="top-row" key={member.username}>
            <span className="top-rank">{index + 1}</span>
            <Avatar name={member.name} profile={member} />
            <Link className="top-name" href={`/membres/${encodeURIComponent(member.username)}`}>
              {member.name}
              <small>{levelName(member.points)}</small>
            </Link>
            <span className="top-pts">+{member.month}</span>
          </div>
        ))}
      </section>
    </CommunityPageLayout>
  );
}
