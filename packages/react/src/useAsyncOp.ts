import { useCallback, useRef, useState } from 'react';
import {
  createAsyncState,
  setError,
  setLoading,
  setSuccess,
  type AsyncState,
  type AsyncOpConfig,
  isAppError,
  createError,
} from '@front-guard/core';

type AsyncFn<TArgs extends any[], TReturn> = (...args: TArgs) => Promise<TReturn>;

export interface UseAsyncOpOptions extends AsyncOpConfig {}

export const useAsyncOp = <TArgs extends any[], TReturn>(
  fn: AsyncFn<TArgs, TReturn>,
  options?: UseAsyncOpOptions,
) => {
  const [state, setState] = useState<AsyncState<TReturn>>(
    () => createAsyncState<TReturn>(),
  );
  const activeId = useRef(0);

  const run = useCallback(
    async (...args: TArgs): Promise<TReturn | undefined> => {
      const id = ++activeId.current;
      setState((prev) => setLoading(prev, options));

      try {
        const result = await fn(...args);
        if (id === activeId.current) {
          setState(setSuccess(result));
        }
        return result;
      } catch (err: any) {
        const appErr = isAppError(err)
          ? err
          : createError(
              'UNKNOWN',
              err?.message ?? 'Unknown error in async op',
              { cause: err },
            );
        if (id === activeId.current) {
          setState((prev) => setError(appErr, prev, options));
        }
        return undefined;
      }
    },
    [fn, options],
  );

  const reset = useCallback(() => {
    activeId.current = 0;
    setState(createAsyncState<TReturn>());
  }, []);

  return { state, run, reset };
};
