'use client';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { CommunityEvent, ReferencePoll } from '@/lib/community-types';
import { Icon } from '@/components/icon';
import { formatNumber } from '@/lib/design';

/** Supplemental widgets preserve the supplied prototype's preview behavior. */
export function PollCard({ poll, inline = false }: { poll: ReferencePoll; inline?: boolean }) {
  const [choice, setChoice] = useState<number | null>(null);
  const total =
    poll.options.reduce((sum, option) => sum + option.votes, 0) + (choice !== null ? 1 : 0);
  return (
    <section className={`card w-poll ${inline ? 'inline-mod' : ''}`}>
      <div className="w-label">
        <Icon name="chart" />
        Sondage de la semaine
      </div>
      <h3
        style={{ fontFamily: 'var(--f-display)', fontSize: 17, lineHeight: 1.3, marginBottom: 12 }}
      >
        {poll.title
          .replace(/^Sondage de la semaine : /i, '')
          .replace(/^./, (letter) => letter.toUpperCase())}
      </h3>
      <div className="poll">
        {poll.options.map((option, index) => {
          const percentage = Math.round(
            ((option.votes + (choice === index ? 1 : 0)) / total) * 100,
          );
          return (
            <button
              key={option.label}
              className={`popt ${choice !== null ? 'res' : ''} ${choice === index ? 'mine' : ''}`}
              aria-pressed={choice === index}
              onClick={() => setChoice(index)}
            >
              {choice !== null ? (
                <span className="pbar" style={{ '--w': `${percentage}%` } as CSSProperties} />
              ) : (
                <span className="pradio" />
              )}
              <span className="plabel">
                {choice === index && <Icon name="check" />}
                {option.label}
              </span>
              {choice !== null && <span className="ppct">{percentage} %</span>}
            </button>
          );
        })}
        <p className="pfoot">
          <span className="num">{formatNumber(total)}</span> votes ·{' '}
          {choice !== null
            ? 'Touchez une autre réponse pour changer d’avis'
            : 'Votez pour voir les résultats'}
        </p>
      </div>
    </section>
  );
}
export function EventCard({ event }: { event: CommunityEvent }) {
  const [registered, setRegistered] = useState(false);
  const date = new Date(event.at);
  return (
    <div className="ev">
      <div className="ev-date">
        <small>
          {date
            .toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'Africa/Lagos' })
            .replace('.', '')}
        </small>
        <b>{date.getUTCDate()}</b>
      </div>
      <div>
        <h4>{event.title}</h4>
        <p>
          {date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            timeZone: 'Africa/Lagos',
          })}{' '}
          à{' '}
          {date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Lagos',
          })}{' '}
          · {event.host}
        </p>
        <div className="row">
          <button
            className={`btn btn-sm ${registered ? 'btn-going' : 'btn-secondary'}`}
            aria-pressed={registered}
            onClick={() => setRegistered(!registered)}
          >
            {registered ? (
              <>
                <Icon name="check" />
                Inscrit
              </>
            ) : (
              'Je participe'
            )}
          </button>
          <span className="muted" style={{ fontSize: 12.5 }}>
            <span className="num">{event.going + (registered ? 1 : 0)}</span> participants
          </span>
        </div>
      </div>
    </div>
  );
}
