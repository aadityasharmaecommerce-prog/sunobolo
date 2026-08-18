/**
 * Converts the Phase 1 mock data (src/data/seed) into D1 seed SQL.
 *
 * Note: D1 executes each statement atomically, so no BEGIN/COMMIT is emitted.
 * All inserts are `INSERT OR IGNORE` (idempotent — safe to re-run).
 *
 * Usage:
 *   npx tsx scripts/seed-d1.mts               # writes scripts/seed.sql
 *   npx tsx scripts/seed-d1.mts --dry        # prints to stdout only
 *   wrangler d1 execute sunobolo-db --remote --file scripts/seed.sql
 */
import { writeFileSync } from 'node:fs';
import { seedData, packagesSeed, usersSeed } from '../src/data/seed/index.ts';

const esc = (s: string): string => `'${s.replace(/'/g, "''")}'`;

const statements: string[] = [];

function insert(table: string, columns: string[], rows: (string | number | null)[][]): void {
  if (rows.length === 0) return;
  statements.push(
    `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES\n` +
      rows.map((r) => `  (${r.map((v) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : esc(v))).join(', ')})`).join(',\n') +
      ';',
  );
}

// ── course_categories ────────────────────────────────────
insert(
  'course_categories',
  ['id', 'name', 'slug', 'sort_order'],
  [
    ['kids', 'Kids English', 'english-for-kids', 1],
    ['students', 'School English', 'school-english', 2],
    ['adults', 'Adult English', 'english-for-beginners', 3],
    ['professionals', 'Professional English', 'interview-english', 4],
  ],
);

// ── courses ──────────────────────────────────────────────
insert(
  'courses',
  [
    'id', 'category_id', 'slug', 'title', 'tagline', 'description', 'long_description',
    'level', 'audience', 'emoji', 'color', 'is_free', 'sort_order', 'featured', 'seo_title', 'seo_description',
    'lesson_count', 'sentence_count',
  ],
  seedData.courses.map((c) => [
    c.id,
    categoryIdFor(c.audience),
    c.slug,
    c.title,
    c.tagline,
    c.description,
    c.longDescription,
    c.level,
    c.audience,
    c.emoji,
    c.color,
    c.isFree ? 1 : 0,
    c.order,
    c.featured ? 1 : 0,
    c.seo.title,
    c.seo.description,
    c.lessonCount,
    c.sentenceCount,
  ]),
);

// ── lessons ──────────────────────────────────────────────
insert(
  'lessons',
  ['id', 'course_id', 'title', 'emoji', 'description', 'sort_order', 'is_free', 'sentence_count'],
  seedData.lessons.map((l) => [l.id, l.courseId, l.title, l.emoji, l.description, l.order, l.isFree ? 1 : 0, l.sentenceCount]),
);

// ── sentences ────────────────────────────────────────────
insert(
  'sentences',
  ['id', 'lesson_id', 'course_id', 'english', 'hindi', 'difficulty', 'sort_order', 'is_free'],
  seedData.sentences.map((s) => [s.id, s.lessonId, s.courseId, s.english, s.hindi, s.difficulty, s.order, s.isFree ? 1 : 0]),
);

// ── packages ─────────────────────────────────────────────
insert(
  'packages',
  ['id', 'name', 'price', 'original_price', 'currency', 'tagline', 'features', 'popular', 'color'],
  packagesSeed.map((p) => [
    p.id,
    p.name,
    p.price,
    p.originalPrice,
    p.currency,
    p.tagline,
    JSON.stringify(p.features),
    p.popular ? 1 : 0,
    p.color,
  ]),
);

// ── package_courses ──────────────────────────────────────
const pcRows: (string | number | null)[][] = [];
for (const p of packagesSeed) {
  if (p.courseIds.includes('*')) {
    for (const c of seedData.courses) pcRows.push([p.id, c.id]);
  } else {
    for (const cid of p.courseIds) pcRows.push([p.id, cid]);
  }
}
insert('package_courses', ['package_id', 'course_id'], pcRows);

// ── users + admin_users (mock/demo) ──────────────────────
insert(
  'users',
  ['id', 'name', 'email', 'avatar_color', 'is_admin', 'created_at'],
  usersSeed.map((u) => [u.id, u.name, u.email, u.avatarColor, u.isAdmin ? 1 : 0, u.createdAt]),
);
insert(
  'admin_users',
  ['user_id', 'role', 'created_at'],
  usersSeed.filter((u) => u.isAdmin).map((u) => [u.id, 'admin', u.createdAt]),
);

function categoryIdFor(audience: string): string | null {
  const map: Record<string, string> = {
    kids: 'kids',
    students: 'students',
    adults: 'adults',
    professionals: 'professionals',
  };
  return map[audience] ?? null;
}

const sql = `-- SunoBolo English — D1 seed data (generated from src/data/seed)\n-- Regenerate: npx tsx scripts/seed-d1.mts\n\n${statements.join('\n\n')}\n`;

if (process.argv.includes('--dry')) {
  console.log(sql);
} else {
  writeFileSync(new URL('./seed.sql', import.meta.url), sql);
  console.log(
    `✅ scripts/seed.sql written — ${seedData.courses.length} courses, ${seedData.lessons.length} lessons, ` +
      `${seedData.sentences.length} sentences, ${packagesSeed.length} packages, ${pcRows.length} package_courses, ${usersSeed.length} users`,
  );
}
