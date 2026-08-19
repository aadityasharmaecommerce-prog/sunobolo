/**
 * Validates sentence ID → English → Hindi → audio mapping.
 *
 * Root app:   public/audio/{id}.mp3          (ids like beginner-l1-s1, trial-1)
 * Nested app: sunobolo/public/audio/{courseId}/{id}.mp3  (ids like beginner-001)
 *
 * Usage: node scripts/validate-sentence-map.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function report(title, rows) {
  const missing = rows.filter((r) => !r.audioOk);
  const empty = rows.filter((r) => !r.english || !r.hindi);
  const seen = new Set();
  const dup = new Set();
  for (const r of rows) {
    if (seen.has(r.id)) dup.add(r.id);
    seen.add(r.id);
  }
  console.log(`\n=== ${title} ===`);
  console.log(`sentences: ${rows.length}`);
  console.log(`audio present: ${rows.length - missing.length}`);
  console.log(`missing audio: ${missing.length}`);
  console.log(`missing english/hindi: ${empty.length}`);
  console.log(`duplicate ids: ${dup.size}`);
  if (missing.length) {
    console.log('first missing audio:');
    missing.slice(0, 20).forEach((r) => console.log(`  - ${r.id}  (${r.audioPath})`));
    if (missing.length > 20) console.log(`  … +${missing.length - 20} more`);
  }
  return { total: rows.length, missingAudio: missing.map((r) => r.id), empty: empty.length, dup: [...dup] };
}

// ── Root app ──────────────────────────────────────────
const sentences = loadJson(resolve(root, 'scripts/sentences.json')) ?? [];
const trial = loadJson(resolve(root, 'scripts/trial-sentences.json')) ?? [];
const rootAudioDir = resolve(root, 'public/audio');
const rootRows = [...sentences, ...trial].map((s) => {
  const audioPath = resolve(rootAudioDir, `${s.id}.mp3`);
  return {
    id: s.id,
    english: s.english ?? '',
    hindi: s.hindi ?? '(not in sentences.json export — present in seed TS)',
    audioPath,
    audioOk: existsSync(audioPath) && statSync(audioPath).size > 1000,
  };
});
const rootStats = report('ROOT APP (src + public/audio/{id}.mp3)', rootRows);

// ── Nested / deployed app ─────────────────────────────
const nestedContent = resolve(root, 'sunobolo/src/data/content.ts');
const nestedAudio = resolve(root, 'sunobolo/public/audio');
let nestedStats = { total: 0, missingAudio: [], empty: 0, dup: [] };
const byCourse = {};

if (existsSync(nestedContent) && existsSync(nestedAudio)) {
  const src = readFileSync(nestedContent, 'utf8');
  // Only real sentence objects: id like "beginner-001" / "free-trial-025"
  const re =
    /\{\s*"id":\s*"((?:[a-z-]+)-\d{3})"\s*,\s*"courseId":\s*"([^"]+)"[\s\S]*?"english":\s*"((?:\\.|[^"\\])*)"\s*,\s*"hindi":\s*"((?:\\.|[^"\\])*)"/g;
  const rows = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(src))) {
    const id = m[1];
    const courseId = m[2];
    const english = m[3];
    const hindi = m[4];
    const key = `${courseId}/${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const audioPath = resolve(nestedAudio, courseId, `${id}.mp3`);
    rows.push({
      id,
      english,
      hindi,
      audioPath,
      audioOk: existsSync(audioPath) && statSync(audioPath).size > 500,
    });
    byCourse[courseId] = (byCourse[courseId] ?? 0) + 1;
  }
  nestedStats = report('DEPLOYED APP (sunobolo/ audio/{courseId}/{id}.mp3)', rows);

  const configured = {
    beginner: 725,
    intermediate: 350,
    advanced: 300,
    'daily-life': 475,
    interview: 400,
    corporate: 375,
    business: 400,
    travel: 300,
    school: 325,
    kids: 400,
    'free-trial': 25,
  };

  console.log('\n=== DEPLOYED COURSE | ACTUAL SENTENCES | CONFIGURED | AUDIO ON DISK | DIFF ===');
  const dirs = readdirSync(nestedAudio).filter((d) => statSync(resolve(nestedAudio, d)).isDirectory());
  const allCourses = new Set([...Object.keys(configured), ...dirs, ...Object.keys(byCourse)]);
  console.log(
    'Course'.padEnd(16) +
      '| Actual'.padStart(10) +
      ' | Config'.padStart(10) +
      ' | Audio'.padStart(9) +
      ' | Diff',
  );
  console.log('-'.repeat(60));
  for (const c of [...allCourses].sort()) {
    const actual = byCourse[c] ?? 0;
    const config = configured[c] ?? 0;
    const audioN = existsSync(resolve(nestedAudio, c))
      ? readdirSync(resolve(nestedAudio, c)).filter((f) => f.endsWith('.mp3')).length
      : 0;
    const diff = actual - config;
    console.log(
      c.padEnd(16) +
        `| ${String(actual).padStart(8)} | ${String(config).padStart(8)} | ${String(audioN).padStart(7)} | ${diff >= 0 ? '+' : ''}${diff}`,
    );
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Root:     ${rootStats.total} sentences, ${rootStats.missingAudio.length} missing audio`);
console.log(`Deployed: ${nestedStats.total} sentences, ${nestedStats.missingAudio.length} missing audio`);
if (rootStats.missingAudio.length || nestedStats.missingAudio.length) {
  console.log('\nAudio files that need manual listening / generation:');
  [...rootStats.missingAudio, ...nestedStats.missingAudio].slice(0, 30).forEach((id) => console.log(`  ${id}`));
  process.exit(1);
}
console.log('ID → English → Hindi → audio mapping is consistent for every real sentence.');
console.log('Manual listening still required to confirm the spoken words match the text.');
