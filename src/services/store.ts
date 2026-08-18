import type { Course, Lesson, Package, Sentence, User } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { readStorage, writeStorage, removeStorage } from '@/utils/storage';
import { seedData, packagesSeed, usersSeed } from '@/data/seed';

/**
 * Bump this version whenever the seed data schema changes so that
 * existing users in localStorage get fresh data automatically.
 */
const DB_VERSION = 2;

interface DBEnvelope {
  _v: number;
  db: DB;
}

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

  // Try the versioned envelope first (DB_VERSION 2+)
  const envelope = readStorage<DBEnvelope | null>(STORAGE_KEYS.db, null);
  if (envelope && typeof envelope === 'object' && '_v' in envelope && typeof (envelope as DBEnvelope)._v === 'number') {
    if ((envelope as DBEnvelope)._v === DB_VERSION && Array.isArray((envelope as DBEnvelope).db?.courses)) {
      state = (envelope as DBEnvelope).db;
      return state;
    }
    // Version mismatch — discard stale DB so fresh seed data is used
    removeStorage(STORAGE_KEYS.db);
    state = createInitialDB();
    return state;
  }

  // Legacy format (no version) — migrate to versioned format
  const legacy = readStorage<DB | null>(STORAGE_KEYS.db, null);
  if (legacy && Array.isArray(legacy.courses)) {
    // Migrate: write with version so next load uses the new format
    const envelope: DBEnvelope = { _v: DB_VERSION, db: legacy };
    writeStorage(STORAGE_KEYS.db, envelope);
    state = legacy;
    return state;
  }

  // No valid data at all — use seed data
  state = createInitialDB();
  return state;
}

export function getDB(): DB {
  return load();
}

export function setDB(next: DB): DB {
  state = next;
  writeStorage(STORAGE_KEYS.db, { _v: DB_VERSION, db: next });
  return next;
}

/** Mutates the store (used by admin CRUD) and persists it. */
export function updateDB(mutator: (db: DB) => void): DB {
  const db = load();
  mutator(db);
  writeStorage(STORAGE_KEYS.db, { _v: DB_VERSION, db });
  return db;
}

export function resetDB(): DB {
  const fresh = createInitialDB();
  state = fresh;
  writeStorage(STORAGE_KEYS.db, { _v: DB_VERSION, db: fresh });
  return fresh;
}
