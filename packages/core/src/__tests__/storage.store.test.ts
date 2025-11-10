import { describe, it, expect } from 'vitest';
import { createStore } from '../storage/store';

describe('createStore', () => {
  it('stores and retrieves values (memory)', () => {
    const store = createStore<{ foo: string }>('test', {
      version: 1,
      storage: 'memory',
    });

    expect(store.get()).toBeNull();
    store.set({ foo: 'bar' });
    expect(store.get()).toEqual({ foo: 'bar' });
  });
});
