import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'strange:favorites';

// In-memory fallback if localStorage is unavailable or corrupted
let memoryFavorites: string[] = [];
let memoryInitialized = false;

// Subscribers list for in-tab reactive state updates
type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function readStorage(): string[] {
  if (typeof window === 'undefined') return memoryFavorites;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (!memoryInitialized) {
        memoryFavorites = [];
        memoryInitialized = true;
      }
      return memoryFavorites;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryFavorites = parsed.filter((id): id is string => typeof id === 'string' && Boolean(id));
      memoryInitialized = true;
      return memoryFavorites;
    }
  } catch (err) {
    console.warn('Failed to parse favorites from storage, falling back to in-memory store:', err);
  }

  return memoryFavorites;
}

function writeStorage(ids: string[]): void {
  memoryFavorites = ids;
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to save favorites to localStorage, using in-memory store:', err);
  }
  notify();
}

// Window cross-tab storage event listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      readStorage();
      notify();
    }
  });
}

/**
 * Check if a specific event id is favorited
 */
export function isFavorite(id: string): boolean {
  const current = readStorage();
  return current.includes(id);
}

/**
 * Toggle favorite state for a given event id
 * Returns true if added, false if removed
 */
export function toggleFavorite(id: string): boolean {
  if (!id) return false;
  const current = readStorage();
  let next: string[];
  const exists = current.includes(id);

  if (exists) {
    next = current.filter((item) => item !== id);
  } else {
    next = [...current, id];
  }

  writeStorage(next);
  return !exists;
}

// Snapshot caching for useSyncExternalStore (must return identical reference if data has not changed)
let cachedSnapshot: string[] = [];
let lastRawJson = '';

function getSnapshot(): string[] {
  const current = readStorage();
  const json = JSON.stringify(current);
  if (json !== lastRawJson) {
    lastRawJson = json;
    cachedSnapshot = current;
  }
  return cachedSnapshot;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * React hook to subscribe to reactive favorites changes with cross-tab sync
 */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, () => []);

  return {
    favorites,
    isFavorite: (id: string) => favorites.includes(id),
    toggleFavorite,
  };
}
