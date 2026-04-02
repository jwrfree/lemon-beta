const OFFLINE_CACHE_PREFIX = 'lemon-offline-cache-v1';

type OfflineSnapshot<T> = {
  savedAt: string;
  data: T;
};

const isBrowser = () => typeof window !== 'undefined';

export const getOfflineCacheKey = (...parts: Array<string | undefined | null>) => {
  return [OFFLINE_CACHE_PREFIX, ...parts.filter(Boolean)].join(':');
};

export function readOfflineSnapshot<T>(key: string): T | undefined {
  if (!isBrowser()) return undefined;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as OfflineSnapshot<T>;
    return parsed?.data;
  } catch {
    return undefined;
  }
}

export function writeOfflineSnapshot<T>(key: string, data: T) {
  if (!isBrowser()) return;

  try {
    const payload: OfflineSnapshot<T> = {
      savedAt: new Date().toISOString(),
      data,
    };

    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore quota and parse issues to keep runtime resilient.
  }
}
