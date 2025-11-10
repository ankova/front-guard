import React from 'react';
import type { AsyncBoundaryState } from './types';

export interface AsyncBoundaryProps<T> {
  state: AsyncBoundaryState<T>;
  loading?: React.ReactNode;
  error?: (error: Error) => React.ReactNode;
  empty?: React.ReactNode;
  children: (data: T) => React.ReactNode;
  isEmpty?(data: T): boolean;
}

export function AsyncBoundary<T>({
  state,
  loading,
  error,
  empty,
  children,
  isEmpty,
}: AsyncBoundaryProps<T>) {
  if (state.status === 'loading') {
    return <>{loading ?? null}</>;
  }

  if (state.status === 'error' && state.error) {
    if (error) return <>{error(state.error)}</>;
    return <div role="alert">{state.error.message}</div>;
  }

  if (state.status === 'success' && state.data !== undefined) {
    if (isEmpty?.(state.data)) {
      return <>{empty ?? null}</>;
    }
    return <>{children(state.data)}</>;
  }

  return null;
}
