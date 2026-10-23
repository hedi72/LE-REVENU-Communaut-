import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Category, Discussion, Session } from '@/lib/types';
import type { Community } from '@/lib/community-types';
import { levelName, levelProgress, profileFor, referenceCategories } from '@/lib/design';
import { Icon, type IconName } from './icon';
import { Avatar } from './ui';
import { AccountMenu, Notifications } from './design-controls';
import { EventCard, PollCard } from '@/features/community/editorial-widgets';

export function Header({ session, community }: { session: Session | null; community: Community }) {
  return (
    <>
      <div className="sitebar">
        <div className="wrap">
          <a className="sb-back" href="https://www.lerevenu.com">
            <Icon name="arrowL" />
            Retour sur lerevenu.com
          </a>
          <nav className="sb-links" aria-label="Rubriques de lerevenu.com">
            {[
              'Bourse',
              'Économie',
              'Placements',
              'Immobilier',
              'Impôts',
              'Succession',
              'Vie pratique',
            ].map((label) => (
              <a href="https://www.lerevenu.com" key={label}>
                {label}
              </a>
            ))}
          </nav>
          <span className="sb-right">
            <a className="sb-mag" href="https://www.lerevenu.com">
              <Icon name="book" />
              Le magazine
            </a>
            <a
              className={`sb-sub ${session ? 'on' : ''}`}
              href="https://www.lerevenu.com/abonnement/"
            >
              {session ? 'Mon abonnement' : 'S’abonner'}
            </a>
          </span>
        </div>
      </div>
      <header className="hdr">
        <div className="wrap hdr-in">
          <Link className="brand" href="/" aria-label="Le Revenu, accueil de la communauté">
            <span className="lr-logo" aria-hidden="true">
              <span className="lr-le">LE</span>
              <span>REVENU</span>
            </span>
            <span className="brand-sep" />
            <span className="brand-sub">Communauté</span>
          </Link>
          <form className="search" action="/" role="search">
            <Icon name="search" />
            <label className="sr-only" htmlFor="q">
              Rechercher une discussion
            </label>
            <input
              id="q"
              name="q"
              placeholder="Rechercher une discussion, un sujet…"
              autoComplete="off"
              maxLength={100}
            />
          </form>
          <div className="hdr-act">
            <Link className="icon-btn search-mobile" href="/recherche" aria-label="Rechercher">
              <Icon name="search" />
            </Link>
            {session ? (
              <>
                <Link className="btn btn-primary hdr-compose" href="/discussions/nouvelle">
                  <Icon name="plus" />
                  Publier
                </Link>
                <Notifications />
                <AccountMenu
                  username={session.username}
                  points={profileFor(session.username, community)?.points}
                />
              </>
            ) : (
              <>
                <Link className="btn btn-quiet" href="/connexion">
                  Se connecter
                </Link>
                <Link className="btn btn-primary hdr-compose" href="/connexion">
                  Rejoindre
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
export function SpaceIcon({
  icon,
  color,
  size = '',
}: {
  icon: string;
  color: string;
  size?: string;
}) {
  return (
    <span className={`sp-ic ${size}`} style={{ '--c': color } as CSSProperties}>
      <Icon name={icon as IconName} />
    </span>
  );
}
export function Sidebar({
  categories,
  community,
  active,
}: {
  categories: Category[];
  community: Community;
  active?: string;
}) {
  const links: [string, IconName, string][] = [
    ['/', 'home', 'Accueil'],
    ['/espaces', 'grid', 'Tous les espaces'],
    ['/classement', 'trophy', 'Classement'],
    ['/charte', 'book', 'Charte'],
  ];
  return (
    <nav className="side" aria-label="Navigation principale">
      {links.map(([href, icon, label]) => (
        <Link
          className={`nav-link ${active === href || (!active && href === '/') ? 'on' : ''}`}
          key={href}
          href={href}
        >
          <Icon name={icon} />
          {label}
        </Link>
      ))}
      <div className="nav-title">Espaces</div>
      {referenceCategories(categories, community).map((category) => (
        <Link
          className={`nav-link ${active === category.slug ? 'on' : ''}`}
          key={category.documentId}
          href={`/?category=${category.slug}`}
          aria-current={active === category.slug ? 'page' : undefined}
        >
          <SpaceIcon icon={category.icon} color={category.color} />
          {category.name}
        </Link>
      ))}
      <a className="nav-foot" href="https://www.lerevenu.com">
        <span>Retour sur lerevenu.com</span>
        <Icon name="external" className="ext" />
      </a>
    </nav>
  );
}
export function CategoryScroller({
  categories,
  community,
  active,
}: {
  categories: Category[];
  community: Community;
  active?: string;
}) {
  return (
    <nav className="cat-scroller" aria-label="Filtrer par espace">
      <Link className={`chip ${!active ? 'on' : ''}`} href="/">
        Tout
      </Link>
      {referenceCategories(categories, community).map((category) => (
        <Link
          key={category.documentId}
          className={`chip ${active === category.slug ? 'on' : ''}`}
          href={`/?category=${category.slug}`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
export function JoinCard() {
  return (
    <section className="card join-card">
      <h3>Rejoignez la communauté</h3>
      <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
        Avec votre compte lerevenu.com, gratuitement.
      </p>
      <ul>
        <li>
          <Icon name="check" />
          Posez vos questions d’argent à des milliers de lecteurs
        </li>
        <li>
          <Icon name="check" />
          Recevez les réponses de la rédaction
        </li>
        <li>
          <Icon name="check" />
          Gagnez des badges en aidant les autres
        </li>
      </ul>
      <Link className="btn btn-primary btn-block" href="/connexion">
        Rejoindre la communauté
      </Link>
    </section>
  );
}
export function ProgressCard({ session, community }: { session: Session; community: Community }) {
  const profile = profileFor(session.username, community);
  const points = profile?.points || 0;
  const { next, percentage, nextName } = levelProgress(points);
  return (
    <section className="card">
      <h2 className="card-title">
        Votre progression
        <Link className="more" href="/mon-compte">
          Mon profil
        </Link>
      </h2>
      <div className="prog-head">
        <Avatar name={session.username} large profile={profile} />
        <div>
          <h3>{levelName(points)}</h3>
          <small>
            <span className="num">{points}</span> points
            {profile?.streak ? (
              <>
                {' '}
                · <Icon name="flame" /> {profile.streak} jours d’affilée
              </>
            ) : null}
          </small>
        </div>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="prog-meta">
        <span>
          {next ? (
            <>
              Encore <b className="num">{next - points}</b> pts pour « {nextName} »
            </>
          ) : (
            'Niveau maximum'
          )}
        </span>
      </div>
      <div className="prog-badges">
        {(['hand', 'msg', 'thumb', 'mail', 'pen', 'star'] as IconName[]).map((icon, index) => (
          <span key={icon} className={`bdg ${index > 3 ? 'locked' : ''}`}>
            <Icon name={icon} />
          </span>
        ))}
      </div>
    </section>
  );
}
export function TopWidget({ community }: { community: Community }) {
  const profiles = community.users
    .filter((profile) => profile.role === 'member')
    .sort((a, b) => b.month - a.month)
    .slice(0, 5);
  return (
    <section className="card">
      <h2 className="card-title">
        <Icon name="trophy" />
        Top du mois
        <Link className="more" href="/classement">
          Classement
        </Link>
      </h2>
      {profiles.map((profile, index) => (
        <div className="top-row" key={profile.username}>
          <span className="top-rank">{index + 1}</span>
          <Avatar name={profile.name} profile={profile} />
          <Link className="top-name" href={`/membres/${encodeURIComponent(profile.username)}`}>
            {profile.name}
            <small>{levelName(profile.points)}</small>
          </Link>
          <span className="top-pts">+{profile.month}</span>
        </div>
      ))}
    </section>
  );
}
export function EventsWidget({ community, category }: { community: Community; category?: string }) {
  const events = community.events.filter((event) => !category || event.cat === category);
  if (!events.length) return null;
  return (
    <section className="card">
      <h2 className="card-title">
        <Icon name="cal" />
        Le Revenu répond
      </h2>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </section>
  );
}
export function RightRail({
  session,
  community,
  discussions = [],
  category,
}: {
  session: Session | null;
  community: Community;
  discussions?: Discussion[];
  category?: string;
}) {
  const weekly = discussions.find((discussion) => discussion.presentation?.featured === 'question');
  const poll = community.polls?.[0];
  const blogs = [...community.blogs].sort((a, b) => a.min - b.min).slice(0, 3);
  return (
    <aside className="right">
      {session ? <ProgressCard session={session} community={community} /> : <JoinCard />}
      {!category && (
        <>
          {weekly && (
            <section className="card w-q">
              <div className="w-label">
                <Icon name="star" />
                Question de la semaine
              </div>
              <Link href={`/discussions/${weekly.documentId}`}>
                <h3>
                  {weekly.title
                    .replace(/^Question de la semaine : /i, '')
                    .replace(/^./, (letter) => letter.toUpperCase())}
                </h3>
              </Link>
              <div className="meta">
                <span className="stack">
                  {weekly.presentation?.participants?.map((name) => (
                    <Avatar
                      key={name}
                      name={name}
                      size="xs"
                      profile={profileFor(name, community)}
                    />
                  ))}
                </span>
                <span>{weekly.replyCount} réponses · posée par la rédaction</span>
              </div>
              <Link
                className="btn btn-secondary btn-sm"
                href={`/discussions/${weekly.documentId}#reponses`}
              >
                Je réponds
              </Link>
            </section>
          )}
          {poll && <PollCard poll={poll} />}
          <section className="card">
            <h2 className="card-title">
              <Icon name="pen" />
              Billets des membres
            </h2>
            <div className="rlist">
              {blogs.map((blog) => {
                const category = community.categories.find(
                  (category) => category.slug === blog.cat,
                );
                return (
                  <Link className="ritem bw" href={`/billets/${blog.id}`} key={blog.id}>
                    <div className="bthumb" style={{ '--c': category?.color } as CSSProperties}>
                      <Icon name={(category?.icon || 'pen') as IconName} />
                    </div>
                    <div>
                      <b>{blog.title}</b>
                      <p>
                        {profileFor(blog.author, community)?.name || blog.author} · 1 min de lecture
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
          <section className="card">
            <h2 className="card-title">
              <Icon name="news" />À la une sur lerevenu.com
            </h2>
            <div className="rlist">
              {community.news.map(([label, title, paid]) => (
                <a className="ritem" key={title} href="https://www.lerevenu.com">
                  <span className="site-kicker">{label}</span>
                  <b>
                    {paid && (
                      <span className="pay-r" title="Réservé aux abonnés">
                        R
                      </span>
                    )}
                    {title}
                  </b>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <a className="btn btn-secondary btn-sm btn-block" href="https://www.lerevenu.com">
                Aller sur lerevenu.com
                <Icon name="external" />
              </a>
            </div>
          </section>
        </>
      )}
      <EventsWidget community={community} category={category} />
      <TopWidget community={community} />
    </aside>
  );
}
