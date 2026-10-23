import React from 'react';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiscussionCard } from '../src/features/discussions/discussion-card';
import type { Discussion } from '../src/lib/types';
const discussion: Discussion = {
  documentId: 'discussion-123',
  title: 'Comment ouvrir un premier PEA ?',
  content: '<script>alert("test")</script>',
  type: 'question',
  createdAt: '2026-10-20T12:00:00Z',
  author: { username: 'Camille Martin' },
  category: { documentId: 'cat-1', name: 'Bourse', slug: 'bourse', description: '' },
  replyCount: 2,
};
test('affiche le titre, l’auteur, la catégorie, la date, les réponses et le lien de détail', () => {
  const html = renderToStaticMarkup(<DiscussionCard discussion={discussion} />);
  for (const value of [
    discussion.title,
    'Camille Martin',
    'Bourse',
    '20 oct. 2026',
    '2 réponse',
    '/discussions/discussion-123',
  ])
    assert.ok(html.includes(value), value);
});
test('échappe le contenu et affiche correctement zéro réponse', () => {
  const html = renderToStaticMarkup(
    <DiscussionCard discussion={{ ...discussion, replyCount: 0 }} />,
  );
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('0 réponse'));
});
