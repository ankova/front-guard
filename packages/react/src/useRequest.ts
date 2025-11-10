import { useEffect } from 'react';
import type { HttpClient, RequestOptions } from '@front-guard/core';
import { useAsyncOp } from './useAsyncOp';

export interface UseRequestOptions<T> extends RequestOptions<T> {
  enabled?: boolean;
  deps?: unknown[];
}

export const useRequest = <T = unknown>(
  client: HttpClient,
  url: string,
  { enabled = true, deps = [], ...options }: UseRequestOptions<T> = {},
) => {
  const { state, run, reset } = useAsyncOp<void[], T>(() => client.get<T>(url, options), {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!enabled) return;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, url, ...deps]);

  return { ...state, refetch: run, reset };
};
