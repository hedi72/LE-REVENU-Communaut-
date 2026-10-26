import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, createStrapiClient } from '../src/lib/strapi-client';

function sequence(responses: (Response | Error)[]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const request = createStrapiClient({
    baseUrl: 'https://api.example.test/',
    readTimeoutMs: 1000,
    retryDelayMs: 1,
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      const next = responses.shift();
      if (next instanceof Error) throw next;
      assert.ok(next, 'Unexpected additional API call');
      return next;
    },
  });
  return { request, calls };
}

test('retries temporary gateway failures and returns live API data', async () => {
  const { request, calls } = sequence([
    new Response('Bad gateway', { status: 502 }),
    new Response('Unavailable', { status: 503 }),
    new Response('Timeout', { status: 504 }),
    Response.json({ data: ['ready'] }),
  ]);
  assert.deepEqual(await request('/categories'), { data: ['ready'] });
  assert.equal(calls.length, 4);
  assert.equal(calls[0].url, 'https://api.example.test/api/categories');
  assert.ok(calls.every(({ init }) => init?.cache === 'no-store'));
});

test('recovers from a network failure and a temporary non-JSON response', async () => {
  const { request, calls } = sequence([
    new TypeError('Connection reset'),
    new Response('<html>Starting</html>'),
    Response.json({ data: [] }),
  ]);
  assert.deepEqual(await request('/discussions'), { data: [] });
  assert.equal(calls.length, 3);
});

test('does not retry validation, authentication, missing resources or rate limits', async () => {
  for (const status of [400, 401, 403, 404, 429, 500]) {
    const { request, calls } = sequence([new Response(null, { status })]);
    await assert.rejects(request('/discussions'), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, status);
      return true;
    });
    assert.equal(calls.length, 1);
  }
});

test('never replays a POST after a gateway or network failure', async () => {
  for (const response of [new Response(null, { status: 502 }), new TypeError('Reset')]) {
    const { request, calls } = sequence([response]);
    await assert.rejects(
      request('/replies', { method: 'POST', body: { data: { content: 'Hello' } }, token: 'test' }),
      ApiError,
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].init?.method, 'POST');
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test');
  }
});

test('stops retrying an unavailable service within the total read budget', async () => {
  const started = performance.now();
  let calls = 0;
  const request = createStrapiClient({
    baseUrl: 'https://api.example.test',
    readTimeoutMs: 40,
    retryDelayMs: 5,
    fetch: async () => {
      calls++;
      return new Response(null, { status: 502 });
    },
  });
  await assert.rejects(request('/community'), ApiError);
  assert.ok(calls > 1);
  assert.ok(performance.now() - started < 1000, 'The retry budget must remain bounded');
});

test('aborts a hanging read instead of leaving a request pending', async () => {
  const request = createStrapiClient({
    baseUrl: 'https://api.example.test',
    readTimeoutMs: 30,
    fetch: async (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        // Keep the test event loop alive until AbortSignal.timeout fires.
        const timer = setTimeout(() => reject(new Error('Abort signal did not fire')), 1000);
        init?.signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(init.signal?.reason);
        });
      }),
  });
  await assert.rejects(
    request('/community'),
    (error) => error instanceof ApiError && error.status === 503,
  );
});
