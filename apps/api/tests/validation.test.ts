import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  authenticatedAuthor,
  discussionInput,
  pageNumber,
  replyInput,
} from '../src/domain/validation';
const valid = {
  title: 'Comment diversifier son épargne ?',
  content: 'Un message de test.',
  category: 'document-category',
  type: 'question',
};
test('valide et normalise une discussion', () => {
  assert.equal(discussionInput({ ...valid, title: `  ${valid.title}  ` }).title, valid.title);
});
test('refuse un titre trop court, un contenu vide et un type inconnu', () => {
  for (const change of [
    { title: 'court' },
    { title: '          ' },
    { content: '  ' },
    { type: 'poll' },
    { category: '' },
    { content: 'x'.repeat(20001) },
  ]) {
    assert.throws(() => discussionInput({ ...valid, ...change }));
  }
});
test('refuse une publication sans utilisateur authentifié', () => {
  assert.throws(() => authenticatedAuthor(null), /Connectez-vous/);
  assert.equal(authenticatedAuthor({ id: 42 }), 42);
});
test('refuse l’usurpation d’auteur et les propriétés internes', () => {
  for (const change of [{ author: 999 }, { createdAt: '2020-01-01' }, { id: 1 }])
    assert.throws(() => discussionInput({ ...valid, ...change }), /non autorisé/);
  assert.throws(
    () => replyInput({ content: 'Bonjour', discussion: 'abc', author: 999 }),
    /non autorisé/,
  );
});
test('refuse les réponses vides et les entrées non structurées', () => {
  assert.throws(() => replyInput({ content: ' ', discussion: 'abc' }));
  assert.throws(() => discussionInput(null));
  assert.throws(() => discussionInput([]));
});
test('borne et valide la pagination', () => {
  assert.equal(pageNumber(undefined), 1);
  assert.equal(pageNumber('2'), 2);
  for (const page of ['0', '-1', '1.5', 'abc', ['2'], '9999999'])
    assert.throws(() => pageNumber(page));
});
