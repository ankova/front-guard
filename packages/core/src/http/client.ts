import { createError } from '../errors';
import type { AppError } from '../errors';
import type { HttpClient, HttpClientConfig, RequestOptions } from './types';

const inFlight = new Map<string, Promise<unknown>>();

const ensureFetch = (): typeof fetch => {
  if (typeof fetch !== 'function') {
    throw createError(
      'UNKNOWN',
      'Global fetch API not found. Please provide a fetch polyfill.',
    );
  }
  return fetch;
};

const buildUrl = (baseUrl: string | undefined, url: string): string => {
  if (!baseUrl) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return baseUrl.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
};

const withTimeout = <T>(
  promise: Promise<T>,
  ms?: number,
  signal?: AbortSignal,
): Promise<T> => {
  if (!ms || ms <= 0) return promise;

  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      if (!signal?.aborted) {
        reject(createError('TIMEOUT', `Request timed out after ${ms}ms`));
      }
    }, ms);

    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function requestWithRetry<T>(
  url: string,
  init: RequestInit,
  config: HttpClientConfig,
  options: RequestOptions<T>,
): Promise<T> {
  const { retry } = config;
  const maxRetries = retry?.retries ?? 0;
  const factor = retry?.factor ?? 2;
  const minTimeoutMs = retry?.minTimeoutMs ?? 200;

  // merge signals into one controller
  const controller = new AbortController();
  const signals = [init.signal, options.signal].filter(
    Boolean,
  ) as AbortSignal[];

  for (const s of signals) {
    if (s.aborted) controller.abort();
    else s.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const finalInit: RequestInit = { ...init, signal: controller.signal };
  const _fetch = ensureFetch();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await withTimeout(
        _fetch(url, finalInit),
        options.timeoutMs ?? config.timeoutMs,
        controller.signal,
      );

      if (!res.ok) {
        let code: AppError['code'] = 'UNKNOWN';
        if (res.status === 401) code = 'UNAUTHORIZED';
        else if (res.status === 403) code = 'FORBIDDEN';
        else if (res.status === 404) code = 'NOT_FOUND';
        else if (res.status >= 500) code = 'SERVER_ERROR';
        const err = createError(code, `HTTP ${res.status} for ${url}`, {
          status: res.status,
        });
        config.onError?.(err, { url, init: finalInit });
        throw err;
      }

      const contentType = res.headers.get('content-type') || '';
      const data =
        contentType.includes('application/json')
          ? await res.json()
          : ((await res.text()) as unknown);

      if (options.schema) {
        try {
          return options.schema.parse(data);
        } catch (e) {
          const err = createError(
            'VALIDATION',
            'Response validation failed',
            { cause: e },
          );
          config.onError?.(err, { url, init: finalInit });
          throw err;
        }
      }

      return data as T;
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ABORTED') {
        throw createError('ABORTED', 'Request was aborted', { cause: err });
      }

      if (attempt === maxRetries) {
        if (!err.code) {
          const wrapped = createError('NETWORK', 'Network error', {
            cause: err,
          });
          config.onError?.(wrapped, { url, init: finalInit });
          throw wrapped;
        }
        throw err;
      }

      const delay = minTimeoutMs * Math.pow(factor, attempt);
      await sleep(delay);
    }
  }

  throw createError('UNKNOWN', 'Unreachable'); // for TS
}

export const createClient = (config: HttpClientConfig = {}): HttpClient => {
  const baseUrl = config.baseUrl;

  const run = async <T>(
    method: string,
    url: string,
    body?: unknown,
    options: RequestOptions<T> = {},
  ): Promise<T> => {
    const fullUrl = buildUrl(baseUrl, url);

    const headers: Record<string, string> = {
      ...(config.defaultHeaders ?? {}),
      ...(options.headers as Record<string, string>),
    };

    const init: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined && method !== 'GET') {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      init.body = headers['Content-Type'].includes('application/json')
        ? JSON.stringify(body)
        : (body as BodyInit);
    }

    if (options.dedupeKey) {
      const key = options.dedupeKey;
      const existing = inFlight.get(key);
      if (existing) return existing as Promise<T>;

      const p = requestWithRetry<T>(fullUrl, init, config, options).finally(
        () => {
          inFlight.delete(key);
        },
      );
      inFlight.set(key, p);
      return p;
    }

    return requestWithRetry<T>(fullUrl, init, config, options);
  };

  return {
    get: (url, options) => run('GET', url, undefined, options),
    post: (url, body, options) => run('POST', url, body, options),
    put: (url, body, options) => run('PUT', url, body, options),
    patch: (url, body, options) => run('PATCH', url, body, options),
    delete: (url, options) => run('DELETE', url, undefined, options),
  };
};
