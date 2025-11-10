import { createError } from '../errors';

export interface StoreConfig<T> {
  version: number;
  migrate?(prevVersion: number, value: any): T | null;
  schema?: {
    parse(data: unknown): T;
  };
  storage?: 'local' | 'session' | 'memory';
}

interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const createMemoryStorage = (): StorageBackend => {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
};

const getBackend = (type: StoreConfig<any>['storage']): StorageBackend => {
  const isBrowser =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  if (!isBrowser || type === 'memory') return createMemoryStorage();

  try {
    if (type === 'session' && window.sessionStorage) return window.sessionStorage;
    if ((!type || type === 'local') && window.localStorage)
      return window.localStorage;
  } catch {
    // blocked or unavailable
  }
  return createMemoryStorage();
};

export interface VersionedPayload<T> {
  v: number;
  value: T;
}

export const createStore = <T>(namespace: string, cfg: StoreConfig<T>) => {
  const backend = getBackend(cfg.storage ?? 'local');
  const key = `fg:${namespace}`;

  const readRaw = (): VersionedPayload<T> | null => {
    try {
      const raw = backend.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.v !== 'number') return null;
      return parsed as VersionedPayload<T>;
    } catch {
      return null;
    }
  };

  const writeRaw = (payload: VersionedPayload<T> | null) => {
    if (!payload) {
      backend.removeItem(key);
      return;
    }
    backend.setItem(key, JSON.stringify(payload));
  };

  const get = (): T | null => {
    const payload = readRaw();
    if (!payload) return null;

    if (payload.v !== cfg.version) {
      if (!cfg.migrate) {
        writeRaw(null);
        return null;
      }
      const migrated = cfg.migrate(payload.v, payload.value);
      if (migrated == null) {
        writeRaw(null);
        return null;
      }
      writeRaw({ v: cfg.version, value: migrated });
      return migrated;
    }

    let value = payload.value;
    if (cfg.schema) {
      try {
        value = cfg.schema.parse(value);
      } catch (e) {
        throw createError('VALIDATION', 'Stored value failed schema validation', {
          cause: e,
        });
      }
    }

    return value as T;
  };

  const set = (value: T | null) => {
    if (value == null) {
      writeRaw(null);
    } else {
      writeRaw({ v: cfg.version, value });
    }
  };

  return { get, set };
};
