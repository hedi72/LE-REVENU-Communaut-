'use client';
import { useActionState } from 'react';
import type { Category } from '@/lib/types';
import { Icon } from '@/components/icon';
import { Avatar } from '@/components/ui';
import { createDiscussion, createReply } from './actions';

export function DiscussionForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createDiscussion, {});
  return (
    <form action={action}>
      <div className="m-body">
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <div className="types" role="radiogroup" aria-label="Type de publication">
          <label className="type">
            <input
              type="radio"
              name="type"
              value="question"
              defaultChecked={!state.values || state.values.type === 'question'}
            />
            <Icon name="help" />
            <b>Poser une question</b>
            <small>Obtenez l’aide des membres et de la rédaction</small>
          </label>
          <label className="type">
            <input
              type="radio"
              name="type"
              value="discussion"
              defaultChecked={state.values?.type === 'discussion'}
            />
            <Icon name="msg" />
            <b>Lancer une discussion</b>
            <small>Partagez une expérience, un avis, une actualité</small>
          </label>
          <a className="type" href="/sondages">
            <Icon name="chart" />
            <b>Les sondages</b>
            <small>Découvrez l’avis de la communauté</small>
          </a>
        </div>
        <div className="field">
          <label htmlFor="c-title">Titre</label>
          <input
            className="input"
            id="c-title"
            name="title"
            minLength={10}
            maxLength={160}
            required
            autoComplete="off"
            defaultValue={state.values?.title}
            placeholder="Ex. : Faut-il ouvrir un PER à 45 ans ?"
            aria-describedby="title-help"
          />
          <span className="hint" id="title-help">
            Un titre clair, formulé comme une question, obtient plus vite des réponses.
          </span>
        </div>
        <div className="field">
          <label htmlFor="c-cat">Espace</label>
          <select
            className="input"
            id="c-cat"
            name="category"
            required
            defaultValue={state.values?.category || ''}
          >
            <option value="" disabled>
              Choisissez un espace…
            </option>
            {categories.map((category) => (
              <option key={category.documentId} value={category.documentId}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-body">Votre message</label>
          <textarea
            className="input"
            id="c-body"
            name="content"
            required
            maxLength={20000}
            rows={5}
            defaultValue={state.values?.content}
            placeholder="Votre situation, ce que vous avez déjà envisagé… Plus le contexte est précis, meilleures sont les réponses."
          />
          <span className="hint">
            Le contenu est obligatoire pour aider les membres à vous répondre.
          </span>
        </div>
        <p className="compliance">
          <Icon name="shield" />
          <span>
            Partagez votre expérience : pas de conseil personnalisé ni de sollicitation.{' '}
            <a href="/charte">Lire la charte</a>
          </span>
        </p>
      </div>
      <div className="m-foot">
        <span className="hint">Titre : 10 caractères minimum</span>
        <button className="btn btn-primary" disabled={pending || !categories.length}>
          {pending ? 'Publication…' : 'Publier la discussion'}
        </button>
      </div>
    </form>
  );
}
export function ReplyForm({
  discussion,
  username = 'Membre',
}: {
  discussion: string;
  username?: string;
}) {
  const [state, action, pending] = useActionState(createReply.bind(null, discussion), {});
  return (
    <form className="post reply-box" action={action}>
      <div className="author">
        <Avatar name={username} />
        <div className="author-sub">
          Répondre en tant que <b style={{ color: 'var(--ink)' }}>{username}</b>
        </div>
      </div>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <label className="sr-only" htmlFor="reply-body">
        Votre réponse
      </label>
      <textarea
        id="reply-body"
        name="content"
        rows={4}
        required
        maxLength={20000}
        defaultValue={state.values?.content}
        placeholder="Partagez votre expérience pour aider la communauté…"
      />
      <div className="reply-foot">
        <span className="hint">Les échanges restent bienveillants et respectueux.</span>
        <button className="btn btn-primary" disabled={pending}>
          {pending ? 'Envoi…' : 'Publier ma réponse'}
        </button>
      </div>
    </form>
  );
}
