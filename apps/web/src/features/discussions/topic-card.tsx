import Link from 'next/link';
import type { Community } from '@/lib/community-types';
import type { Discussion } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { formatNumber, profileFor, relativeDate } from '@/lib/design';
import { Icon } from '@/components/icon';
import { Avatar } from '@/components/ui';

export function TypeTag({ discussion }: { discussion: Discussion }) {
  if (discussion.presentation?.kind === 'poll')
    return (
      <span className="tag tag-poll">
        <Icon name="chart" />
        Sondage
      </span>
    );
  if (discussion.presentation?.solved)
    return (
      <span className="tag tag-ok">
        <Icon name="check" />
        Résolu
      </span>
    );
  return discussion.type === 'question' ? <span className="tag tag-q">Question</span> : null;
}
export function DiscussionCard({
  discussion,
  community,
  compact = false,
}: {
  discussion: Discussion;
  community?: Community;
  compact?: boolean;
}) {
  const display = discussion.presentation;
  const author = profileFor(discussion.author.username, community);
  const count =
    display?.kind === 'poll'
      ? (display.options || []).reduce((sum, option) => sum + option.votes, 0)
      : discussion.replyCount;
  const href = `/discussions/${discussion.documentId}`;
  if (compact)
    return (
      <Link className={`trow ${display?.pinned ? 'pinned' : ''}`} href={href}>
        <span className="tt">
          <span className="tt-main">
            <b>{discussion.title}</b>
            <span className="tt-meta">
              <small>
                {discussion.category?.name} · {discussion.author.username}
              </small>
              <TypeTag discussion={discussion} />
            </span>
          </span>
        </span>
        <span className="c-num">{discussion.replyCount}</span>
        <span className="c-num c-views">{formatNumber(display?.views || 0)}</span>
        <time className="c-num" dateTime={discussion.createdAt}>
          {relativeDate(discussion.createdAt)}
        </time>
      </Link>
    );
  return (
    <article className={`tcard ${display?.pinned ? 'pinned' : ''}`}>
      <div>
        <Link
          className={`tcount ${display?.kind === 'poll' ? 'poll' : display?.solved ? 'solved' : !discussion.replyCount ? 'zero' : ''}`}
          href={`${href}#reponses`}
          aria-label={`${count} ${display?.kind === 'poll' ? 'votes' : `réponse${count > 1 ? 's' : ''}`}`}
        >
          <b className="num">
            {display?.solved && <Icon name="check" />}
            {formatNumber(count)}
          </b>
          <span>{display?.kind === 'poll' ? 'votes' : `réponse${count > 1 ? 's' : ''}`}</span>
        </Link>
      </div>
      <div>
        <div className="tmeta">
          {discussion.category && (
            <Link className="cat-tag" href={`/?category=${discussion.category.slug}`}>
              {discussion.category.name}
            </Link>
          )}
          <TypeTag discussion={discussion} />
          {!discussion.replyCount &&
            display?.kind !== 'poll' &&
            Date.now() - new Date(discussion.createdAt).getTime() < 6 * 60 * 60 * 1000 && (
              <span className="tag tag-new">Nouveau</span>
            )}
          {display?.pinned && (
            <span className="tag tag-pin">
              <Icon name="pin" />
              Épinglé
            </span>
          )}
          {!discussion.replyCount &&
            display?.kind !== 'poll' &&
            Date.now() - new Date(discussion.createdAt).getTime() < 6 * 60 * 60 * 1000 && (
              <span className="tag tag-new">Nouveau</span>
            )}
        </div>
        <h3 className="ttitle">
          <Link className="discussion-link" href={href}>
            {discussion.title}
          </Link>
        </h3>
        <p className="texcerpt">{discussion.content.replace(/\*\*/g, '').replace(/\n+/g, ' ')}</p>
        <div className="tfoot">
          <span className="byline">
            <Avatar name={discussion.author.username} size="xs" profile={author} />
            <b>{discussion.author.username}</b>
            {author?.role === 'redaction' && (
              <span className="tag tag-redac">
                <Icon name="check" />
                Rédaction
              </span>
            )}
            <time dateTime={discussion.createdAt} title={formatDate(discussion.createdAt)}>
              · {relativeDate(discussion.createdAt)}
            </time>
          </span>
          <span className="tstats">
            {Boolean(display?.participants?.length) && (
              <span className="stack">
                {display?.participants?.map((name) => (
                  <Avatar key={name} name={name} size="xs" profile={profileFor(name, community)} />
                ))}
              </span>
            )}
            <span title="Utile">
              <Icon name="thumb" />
              <span className="num">{display?.likes || 0}</span>
            </span>
            <span className="views" title="Vues">
              <Icon name="eye" />
              <span className="num">{formatNumber(display?.views || 0)}</span>
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
