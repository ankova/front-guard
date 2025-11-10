import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '../http/client';

describe('createClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses JSON on success', async () => {
    vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    } as any);

    const client = createClient({ baseUrl: 'https://api.test' });
    const res = await client.get<{ ok: boolean }>('/ping');
    expect(res.ok).toBe(true);
  });

  it('retries then throws on 500', async () => {
    let count = 0;
    vi.spyOn(globalThis, 'fetch' as any).mockImplementation(async () => {
      count++;
      return {
        ok: false,
        status: 500,
        headers: { get: () => 'application/json' },
        json: async () => ({}),
      } as any;
    });

    const client = createClient({
      retry: { retries: 2, minTimeoutMs: 1, factor: 1 },
    });

    await expect(client.get('/fail')).rejects.toHaveProperty('code', 'SERVER_ERROR');
    expect(count).toBe(3);
  });
});
