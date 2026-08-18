import type { Course, Lesson, Package, Sentence, User } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { readStorage, writeStorage } from '@/utils/storage';
import { seedData, packagesSeed, usersSeed } from '@/data/seed';

/**
 * A tiny localStorage-backed database that mimics the future D1 tables.
 * Admin CRUD writes here; the public services read from here. This is what
 * Phase 2 replaces with `fetch` calls to the Cloudflare Worker.
 */
export interface DB {
  courses: Course[];
  lessons: Lesson[];
  sentences: Sentence[];
  packages: Package[];
  users: User[];
}

function createInitialDB(): DB {
  return {
    courses: seedData.courses,
    lessons: seedData.lessons,
    sentences: seedData.sentences,
    packages: packagesSeed,
    users: usersSeed,
  };
}

let state: DB | null = null;

function load(): DB {
  if (state) return state;
  const saved = readStorage<DB | null>(STORAGE_KEYS.db, null);
  // If the stored schema is outdated, fall back to seed data.
  state = saved && Array.isArray(saved.courses) ? saved : createInitialDB();
  return state;
}

export function getDB(): DB {
  return load();
}

export function setDB(next: DB): DB {
  state = next;
  writeStorage(STORAGE_KEYS.db, next);
  return next;
}

/** Mutates the store (used by admin CRUD) and persists it. */
export function updateDB(mutator: (db: DB) => void): DB {
  const db = load();
  mutator(db);
  writeStorage(STORAGE_KEYS.db, db);
  return db;
}

export function resetDB(): DB {
  const fresh = createInitialDB();
  state = fresh;
  writeStorage(STORAGE_KEYS.db, fresh);
  return fresh;
}
