import { createClient } from '@front-guard/core';

export const api = createClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  timeoutMs: 5000,
  retry: { retries: 1, minTimeoutMs: 200 },
});
