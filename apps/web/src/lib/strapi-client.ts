import { setTimeout as delay } from 'node:timers/promises';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown; token?: string };
const unavailable = 'Le service est temporairement indisponible. Réessayez dans un instant.';
const transientStatuses = new Set([502, 503, 504]);
const messages: Record<number, string> = {
  400: 'Vérifiez les informations saisies.',
  401: 'Connectez-vous pour continuer.',
  403: 'Vous n’êtes pas autorisé à effectuer cette action.',
  404: 'Cette ressource est introuvable.',
  429: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
  502: unavailable,
  503: unavailable,
  504: unavailable,
};

export function createStrapiClient({
  baseUrl,
  readTimeoutMs = 12000,
  writeTimeoutMs = 12000,
  retryDelayMs = 1000,
  fetch: fetchRequest = globalThis.fetch,
}: {
  baseUrl: string;
  readTimeoutMs?: number;
  writeTimeoutMs?: number;
  retryDelayMs?: number;
  fetch?: typeof globalThis.fetch;
}) {
  const base = baseUrl.replace(/\/+$/, '');

  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method || 'GET';
    const reading = method === 'GET';
    const deadline = performance.now() + (reading ? readTimeoutMs : writeTimeoutMs);
    let attempt = 0;
    let failure = new ApiError(503, unavailable);

    while (performance.now() < deadline) {
      attempt++;
      try {
        const response = await fetchRequest(`${base}/api${path}`, {
          method,
          cache: 'no-store',
          signal: AbortSignal.timeout(Math.max(1, Math.ceil(deadline - performance.now()))),
          headers: {
            'Content-Type': 'application/json',
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          },
          ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new ApiError(
            response.status,
            messages[response.status] || 'Une erreur est survenue. Réessayez plus tard.',
          );
        }
        return (await response.json()) as T;
      } catch (error) {
        failure = error instanceof ApiError ? error : new ApiError(503, unavailable);
        // A timed-out POST may already have been committed by Strapi. Never replay it.
        if (!reading || !transientStatuses.has(failure.status)) throw failure;
      }

      const remaining = deadline - performance.now();
      if (remaining <= 0) break;
      await delay(Math.min(retryDelayMs * 2 ** Math.min(attempt - 1, 4), 10000, remaining));
    }
    throw failure;
  };
}
