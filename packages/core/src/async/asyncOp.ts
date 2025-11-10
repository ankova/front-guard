import type { AppError } from '../errors';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  error?: AppError;
}

export interface AsyncOpConfig {
  keepPreviousData?: boolean;
}

export const createAsyncState = <T>(): AsyncState<T> => ({
  status: 'idle',
});

export const setLoading = <T>(
  prev: AsyncState<T>,
  cfg?: AsyncOpConfig,
): AsyncState<T> => ({
  status: 'loading',
  data: cfg?.keepPreviousData ? prev.data : undefined,
  error: undefined,
});

export const setSuccess = <T>(data: T): AsyncState<T> => ({
  status: 'success',
  data,
  error: undefined,
});

export const setError = <T>(
  error: AppError,
  prev?: AsyncState<T>,
  cfg?: AsyncOpConfig,
): AsyncState<T> => ({
  status: 'error',
  error,
  data: cfg?.keepPreviousData ? prev?.data : undefined,
});
