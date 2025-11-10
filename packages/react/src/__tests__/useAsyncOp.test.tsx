import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncOp } from '../useAsyncOp';

describe('useAsyncOp', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('runs async function and sets success state', async () => {
    const fn = vi.fn(async (value: number) => {
      // simulate async work
      await new Promise((resolve) => setTimeout(resolve, 0));
      return value * 2;
    });

    const { result } = renderHook(() => useAsyncOp<[number], number>(fn));

    // initial
    expect(result.current.state.status).toBe('idle');

    await act(async () => {
      await result.current.run(2);
    });

    // final expectations (we don't overfit loading timing)
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
    expect(result.current.state.status).toBe('success');
    expect(result.current.state.data).toBe(4);
    expect(result.current.state.error).toBeUndefined();
  });

  it('ensures latest call wins (slow then fast)', async () => {
    vi.useFakeTimers();

    const fn = vi.fn(
      (delay: number) =>
        new Promise<number>((resolve) => {
          setTimeout(() => resolve(delay), delay);
        }),
    );

    const { result } = renderHook(() => useAsyncOp<[number], number>(fn));

    // Fire two calls: 50ms then 10ms
    act(() => {
      result.current.run(50);
      result.current.run(10);
    });

    // Resolve all timers
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Two calls executed
    expect(fn).toHaveBeenCalledTimes(2);

    // We only care that the hook ends in a consistent success state
    // with the last invocation result (10)
    expect(result.current.state.status).toBe('success');
    expect(result.current.state.data).toBe(10);
    expect(result.current.state.error).toBeUndefined();
  });
});
