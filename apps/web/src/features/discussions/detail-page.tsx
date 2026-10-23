import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getCommunity, getDiscussion, getReplies, ApiError } from '@/lib/strapi';
import { getSession } from '@/lib/session';
import { formatDate } from '@/lib/format';
import { formatNumber, profileFor, relativeDate } from '@/lib/design';
import { Sidebar, SpaceIcon, EventsWidget } from '@/components/shell';
import { Avatar, EmptyState, PaginationLinks } from '@/components/ui';
import { Icon } from '@/components/icon';
import { RichText } from '@/components/rich-text';
import { CopyLink } from '@/components/design-controls';
import { TypeTag } from './topic-card';
import { ReplyForm } from './forms';

export default async function DiscussionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const page =
    typeof search.page === 'string' && /^[1-9]\d{0,5}$/.test(search.page) ? search.page : '1';
  const request = getDiscussion(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const [{ data: discussion }, replies, { data: categories }, { data: community }, session] =
    await Promise.all([
      request,
      getReplies(id, page),
      getCategories(),
      getCommunity(),
      getSession(),
    ]);
  const category = community.categories.find(
    (category) => category.slug === discussion.category?.slug,
  );
  const author = profileFor(discussion.author.username, community);
  const publish = session ? '/discussions/nouvelle' : '/connexion';
  return (
    <div className="wrap">
      <div className="layout">
        <Sidebar categories={categories} community={community} active={discussion.category?.slug} />
        <main className="main" id="contenu">
          <nav className="crumbs" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <Icon name="chev" />
            <Link href={`/?category=${discussion.category?.slug || ''}`}>
              {discussion.category?.name}
            </Link>
          </nav>
          <article className="post post-main">
            <div className="tmeta">
              <Link className="cat-tag" href={`/?category=${discussion.category?.slug || ''}`}>
                {discussion.category?.name}
              </Link>
              <TypeTag discussion={discussion} />
            </div>
            <h1>{discussion.title}</h1>
            <div className="author">
              <Avatar name={discussion.author.username} large profile={author} />
              <div>
                <div className="author-name">
                  {discussion.author.username}
                  {author?.role === 'redaction' && (
                    <span className="tag tag-redac">
                      <Icon name="check" />
                      Rédaction
                    </span>
                  )}
                </div>
                <div className="author-sub">
                  <time dateTime={discussion.createdAt} title={formatDate(discussion.createdAt)}>
                    {relativeDate(discussion.createdAt)}
                  </time>{' '}
                  · <span className="num">{formatNumber(discussion.presentation?.views || 0)}</span>{' '}
                  vues
                </div>
              </div>
            </div>
            <RichText content={discussion.content} />
            <div className="actions">
              <a className="act" href="#reponses">
                <Icon name="msg" />
                Répondre
              </a>
              <CopyLink />
            </div>
          </article>
          <section className="replies" id="reponses" aria-label="Réponses">
            <h2 className="section-title">
              {replies.meta.pagination.total
                ? `${replies.meta.pagination.total} réponse${replies.meta.pagination.total > 1 ? 's' : ''}`
                : 'Aucune réponse pour l’instant'}
            </h2>
            {search.replied === '1' && (
              <p className="success-message" role="status">
                Votre réponse a bien été publiée.
              </p>
            )}
            {replies.data.map((reply) => (
              <article className="post reply" key={reply.documentId}>
                <div className="author">
                  <Avatar
                    name={reply.author.username}
                    profile={profileFor(reply.author.username, community)}
                  />
                  <div>
                    <div className="author-name">{reply.author.username}</div>
                    <div className="author-sub">
                      <time dateTime={reply.createdAt} title={formatDate(reply.createdAt)}>
                        {relativeDate(reply.createdAt)}
                      </time>
                    </div>
                  </div>
                </div>
                <RichText content={reply.content} />
              </article>
            ))}
            <PaginationLinks pagination={replies.meta.pagination} base={`/discussions/${id}`} />
            {session ? (
              <ReplyForm discussion={id} username={session.username} />
            ) : (
              <div className="post reply-login">
                <h3>Vous avez un avis ou une expérience à partager ?</h3>
                <p className="muted">Rejoignez la communauté avec votre compte lerevenu.com.</p>
                <Link className="btn btn-primary" href="/connexion">
                  Se connecter pour répondre
                </Link>
              </div>
            )}
          </section>
        </main>
        <aside className="right">
          {!discussion.replyCount && (
            <section className="card help-card">
              <h3>Soyez le premier à aider {discussion.author.username}</h3>
              <p>Votre expérience compte, même partielle.</p>
              <a className="btn btn-primary btn-sm" href="#reponses">
                Répondre
              </a>
            </section>
          )}
          <section className="card">
            <h2 className="card-title">Cette discussion</h2>
            <div className="facts">
              <div>
                <small>Réponses</small>
                <b>{replies.meta.pagination.total}</b>
              </div>
              <div>
                <small>Utile</small>
                <b>{discussion.presentation?.likes || 0}</b>
              </div>
              <div>
                <small>Vues</small>
                <b>{formatNumber(discussion.presentation?.views || 0)}</b>
              </div>
              <div>
                <small>Dernière activité</small>
                <b style={{ fontSize: 13.5, fontFamily: 'var(--f-body)' }}>
                  {relativeDate(replies.data.at(-1)?.createdAt || discussion.createdAt)}
                </b>
              </div>
            </div>
          </section>
          {category && (
            <section className="card cat-card">
              <h3>
                <SpaceIcon icon={category.icon} color={category.color} />
                {category.name}
              </h3>
              <p>{category.desc}</p>
              <Link className="btn btn-secondary btn-sm" href={publish}>
                <Icon name="plus" />
                Publier dans cet espace
              </Link>
              <div>
                <a className="site-link" href="https://www.lerevenu.com">
                  <Icon name="external" />
                  La rubrique sur lerevenu.com
                </a>
              </div>
            </section>
          )}
          <EventsWidget community={community} category={discussion.category?.slug} />
        </aside>
      </div>
    </div>
  );
}
