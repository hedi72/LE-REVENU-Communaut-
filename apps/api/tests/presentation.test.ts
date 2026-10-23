import assert from 'node:assert/strict';
import { test } from 'node:test';
import { presentDiscussion, presentReply } from '../src/domain/presentation';
test('les DTO ne divulguent pas l’e-mail, le mot de passe ou les données internes de l’auteur', () => {
  const author = {
    id: 1,
    username: 'Camille',
    email: 'private@example.com',
    password: 'private-hash',
    resetPasswordToken: 'secret',
  };
  const reply = presentReply({
    documentId: 'r1',
    content: 'Merci',
    createdAt: '2026-01-01',
    author,
  });
  assert.deepEqual(reply.author, { username: 'Camille' });
  const discussion = presentDiscussion({
    documentId: 'd1',
    title: 'Une discussion',
    content: 'Contenu',
    type: 'question',
    createdAt: '2026-01-01',
    author,
    category: null,
    replies: { count: 3 },
  });
  assert.deepEqual(discussion.author, { username: 'Camille' });
  assert.equal(discussion.replyCount, 3);
  assert.ok(!JSON.stringify(discussion).includes('private'));
});
