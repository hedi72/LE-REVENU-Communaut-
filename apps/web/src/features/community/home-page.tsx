import Link from 'next/link';
import { Fragment } from 'react';
import { CategoryScroller, RightRail, Sidebar, SpaceIcon } from '@/components/shell';
import { Avatar, EmptyState, PaginationLinks } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { getCategories, getCommunity, getDiscussions } from '@/lib/strapi';
import { getSession } from '@/lib/session';
import { formatNumber, profileFor, referenceCategories } from '@/lib/design';
import { DiscussionCard } from '@/features/discussions/topic-card';
import { PollCard } from './editorial-widgets';

type SearchParams = Record<string, string | string[] | undefined>;
const single = (value: string | string[] | undefined) => (typeof value === 'string' ? value : '');
export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const search = await searchParams;
  const category = single(search.category).slice(0, 100);
  const q = single(search.q).slice(0, 100);
  const sort = ['newest', 'oldest', 'trending'].includes(single(search.sort))
    ? single(search.sort)
    : 'trending';
  const unanswered = search.unanswered === 'true';
  const compact = search.density === 'compact';
  const page = /^[1-9]\d{0,5}$/.test(single(search.page)) ? single(search.page) : '1';
  const params = {
    ...(category && { category }),
    ...(q && { q }),
    sort,
    ...(unanswered && { unanswered: 'true' }),
    ...(compact && { density: 'compact' }),
    ...(single(search.view) && { view: single(search.view) }),
  };
  const [{ data: categories }, { data: community }, result, session] = await Promise.all([
    getCategories(),
    getCommunity(),
    getDiscussions(new URLSearchParams({ ...params, page })),
    getSession(),
  ]);
  const selected = community.categories.find((item) => item.slug === category);
  const selectedCategory = categories.find((item) => item.slug === category);
  const publish = session ? '/discussions/nouvelle' : '/connexion';
  const currentProfile = session ? profileFor(session.username, community) : undefined;
  const unansweredCount = result.data.filter(
    (discussion) => !discussion.replyCount && discussion.presentation?.kind !== 'poll',
  ).length;
  const filterUrl = (changes: Record<string, string>) =>
    `/?${new URLSearchParams({ ...params, ...changes, page: '1' })}`;
  const tabs: { label: string; icon: IconName; href: string; active: boolean }[] = [
    ...(session && !category
      ? [
          {
            label: 'Pour vous',
            icon: 'spark' as const,
            href: filterUrl({ sort: 'trending', unanswered: '', view: 'foryou' }),
            active: sort === 'trending' && !unanswered && search.view !== 'trending',
          },
        ]
      : []),
    {
      label: 'Tendances',
      icon: 'trend',
      href: filterUrl({ sort: 'trending', unanswered: '', view: 'trending' }),
      active:
        sort === 'trending' &&
        !unanswered &&
        (!session || Boolean(category) || search.view === 'trending'),
    },
    {
      label: 'Récentes',
      icon: 'clock',
      href: filterUrl({ sort: 'newest', unanswered: '' }),
      active: sort !== 'trending' && !unanswered,
    },
    {
      label: 'Sans réponse',
      icon: 'help',
      href: filterUrl({ unanswered: 'true' }),
      active: unanswered,
    },
  ];
  return (
    <div className="wrap">
      <div className="layout">
        <Sidebar categories={categories} community={community} active={category || '/'} />
        <main className="main" id="contenu">
          {q ? (
            <header className="page-head">
              <h1>Rechercher</h1>
              <p>
                {result.meta.pagination.total} résultat{result.meta.pagination.total > 1 ? 's' : ''}{' '}
                pour « {q} »
              </p>
            </header>
          ) : selected ? (
            <section className="cat-head">
              <SpaceIcon icon={selected.icon} color={selected.color} size="lg" />
              <div className="grow">
                <h1>{selected.name}</h1>
                <p>{selected.desc}</p>
                <div className="stats">
                  <span>
                    <b className="num">{result.meta.pagination.total}</b> discussions
                  </span>
                  <span>
                    <b className="num">{formatNumber(selected.posts)}</b> réponses
                  </span>
                  <span>
                    <b className="num">{Math.round(selected.posts / 9)}</b> membres actifs ce
                    mois-ci
                  </span>
                </div>
                <a className="site-link" href="https://www.lerevenu.com">
                  <Icon name="external" />
                  Toute la rubrique « {selected.name} » sur lerevenu.com
                </a>
              </div>
              <Link className="btn btn-primary" href={publish}>
                <Icon name="plus" />
                Publier ici
              </Link>
            </section>
          ) : session ? (
            <div className="greet">
              <h1>Bonjour {currentProfile?.name || session.username.split(' ')[0]}</h1>
              {currentProfile?.streak && currentProfile.streak > 1 ? (
                <span className="streak">
                  <Icon name="flame" />
                  {currentProfile.streak} jours d’affilée
                </span>
              ) : null}
            </div>
          ) : (
            <section className="hero">
              <div>
                <h1>La communauté des lecteurs du Revenu</h1>
                <p>
                  Posez vos questions d’argent, partagez vos expériences et échangez avec la
                  rédaction. Bourse, épargne, impôts, retraite, transmission.
                </p>
                <div className="hero-stats">
                  <span>
                    <b>{formatNumber(community.summary.members)}</b>membres
                  </span>
                  <span>
                    <b>{formatNumber(community.summary.discussions)}</b>discussions
                  </span>
                  <span>
                    <b>{formatNumber(community.summary.replies)}</b>réponses
                  </span>
                  <span>
                    <b>{community.summary.resolved} %</b>des questions résolues
                  </span>
                </div>
              </div>
              <div className="hero-cta">
                <Link className="btn btn-primary" href="/connexion">
                  Rejoindre gratuitement
                </Link>
                <Link className="btn btn-quiet" href="/espaces">
                  Explorer les espaces
                </Link>
              </div>
            </section>
          )}
          {!q && !category && (
            <div className="quick" role="group">
              {session ? (
                <Avatar name={session.username} large profile={currentProfile} />
              ) : (
                <span className="av av-md" style={{ '--c': 'var(--ink-3)' } as React.CSSProperties}>
                  <Icon name="user" />
                </span>
              )}
              <Link className="quick-input" href={publish}>
                Posez votre question à la communauté…
              </Link>
              <div className="quick-types">
                <Link className="quick-type" href={`${publish}?type=question`}>
                  <Icon name="help" />
                  Question
                </Link>
                <Link className="quick-type" href={`${publish}?type=discussion`}>
                  <Icon name="msg" />
                  Discussion
                </Link>
                <Link className="quick-type" href="/sondages">
                  <Icon name="chart" />
                  Sondage
                </Link>
              </div>
            </div>
          )}
          <CategoryScroller categories={categories} community={community} active={category} />
          <div className="feed-bar">
            <nav className="tabs" aria-label="Trier les discussions">
              {tabs.map((tab) => (
                <Link
                  className={`tab ${tab.active ? 'on' : ''}`}
                  key={tab.label}
                  aria-current={tab.active ? 'page' : undefined}
                  href={tab.href}
                >
                  <Icon name={tab.icon} />
                  {tab.label}
                  {tab.label === 'Sans réponse' && unansweredCount > 0 ? (
                    <span className="cnt">{unansweredCount}</span>
                  ) : null}
                </Link>
              ))}
            </nav>
            <span className="seg-ic" role="group" aria-label="Affichage de la liste">
              <Link
                className={!compact ? 'on' : ''}
                aria-label="Vue détaillée"
                href={filterUrl({ density: '' })}
              >
                <Icon name="rows" />
              </Link>
              <Link
                className={compact ? 'on' : ''}
                aria-label="Vue compacte"
                href={filterUrl({ density: 'compact' })}
              >
                <Icon name="list" />
              </Link>
            </span>
          </div>
          <h2 className="sr-only" id="discussions-title">
            Les discussions
          </h2>
          {result.data.length ? (
            <div className={`feed ${compact ? 'feed-compact' : ''}`}>
              {compact && (
                <div className="trow trow-head">
                  <span>Discussion</span>
                  <span className="c-num">Réponses</span>
                  <span className="c-num c-views">Vues</span>
                  <span className="c-num">Activité</span>
                </div>
              )}
              {result.data.map((discussion, index) => (
                <Fragment key={discussion.documentId}>
                  <DiscussionCard discussion={discussion} community={community} compact={compact} />
                  {!category && !compact && index === 2 && community.polls?.[0] && (
                    <PollCard poll={community.polls[0]} inline />
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            <EmptyState title="Rien ici pour l’instant">
              Lancez la première discussion de cet espace.
            </EmptyState>
          )}
          <PaginationLinks pagination={result.meta.pagination} base="/" params={params} />
        </main>
        <RightRail
          session={session}
          community={community}
          discussions={result.data}
          category={selectedCategory?.slug}
        />
      </div>
    </div>
  );
}
