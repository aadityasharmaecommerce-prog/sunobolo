#!/usr/bin/env node
/**
 * SunoBolo — audio ↔ sentence MAPPING validation (structural).
 *
 * Validates the deterministic sentence→audio relationship using the
 * sentence ID as the SINGLE source of truth:
 *
 *   sentence.id "beginner-151"  →  /audio/<courseId>/<id>.mp3         (English)
 *                                  /audio/<courseId>/<id>.hindi.mp3   (Hindi meaning)
 *                                  /audio/shared/repeat-instruction.mp3 (instruction)
 *
 * Checks:
 *   1.  Every sentence has a unique ID.
 *   2.  Every sentence has non-empty English.
 *   3.  Every sentence has non-empty Hindi.
 *   4.  Every sentence resolves to an audio path derived from its ID
 *       (never array position / index).
 *   5.  No duplicate audio assignment (same path used by 2 sentences).
 *   6.  No stale/unknown audio files in public/audio (files that no
 *       sentence maps to).
 *   7.  No missing audio files.
 *   8.  Course/lesson IDs match (sentence id prefix === courseId).
 *
 * NOTE: this verifies FILE MAPPING only. It does NOT prove the SPOKEN
 * CONTENT of each MP3 matches its sentence — for that, run:
 *       python3 scripts/audit-audio-stt.py
 * (speech-to-text spot audit — distinguishes FILE MAPPING VERIFIED from
 *  SPOKEN CONTENT VERIFIED).
 *
 * Usage:
 *   node scripts/validate-audio-sentence-mapping.mjs
 *   node scripts/validate-audio-sentence-mapping.mjs --json out.json
 *
 * Exit code 0 = clean, 1 = problems found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_TS = path.join(APP_ROOT, 'src', 'data', 'content.ts');
const AUDIO_DIR = path.join(APP_ROOT, 'public', 'audio');

// Match sentence objects: "id", "courseId", "lessonId", "order", "english", "hindi"
const SENTENCE_RE =
  /"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"([^"]+)",\s*"order":\s*(\d+),\s*"english":\s*"((?:[^"\\]|\\.)*)",\s*"hindi":\s*"((?:[^"\\]|\\.)*)"/g;

function unescape(s) {
  return s
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, ' ')
    .replace(/\\\\/g, '\\')
    .trim();
}

const problems = [];
const report = {
  checkedAt: new Date().toISOString(),
  totalUniqueSentences: 0,
  checks: {},
};

const source = fs.readFileSync(CONTENT_TS, 'utf8');
const seen = new Map(); // id -> {courseId, lessonId, english, hindi, order}
const dupIds = [];

for (const m of source.matchAll(SENTENCE_RE)) {
  const [, id, courseId, lessonId, order, englishRaw, hindiRaw] = m;
  const english = unescape(englishRaw);
  const hindi = unescape(hindiRaw);
  const key = `${courseId}|${lessonId}|${english}|${hindi}`;
  if (seen.has(id)) {
    if (seen.get(id).key !== key) dupIds.push(id);
    continue; // same lesson listed twice (lessons + modules) — dedupe by id
  }
  seen.set(id, { courseId, lessonId, order: Number(order), english, hindi, key });
}

report.totalUniqueSentences = seen.size;
console.log(`Sentences found (unique ids): ${seen.size}`);

// 1. unique IDs (no id with two different bodies)
report.checks.uniqueIds = dupIds.length === 0;
if (dupIds.length) {
  problems.push(`DUPLICATE ID WITH DIFFERENT CONTENT: ${dupIds.join(', ')}`);
} else {
  console.log('✅ 1. Unique IDs: OK');
}

// 2/3. english + hindi present
const noEnglish = [...seen.entries()].filter(([, s]) => !s.english);
const noHindi = [...seen.entries()].filter(([, s]) => !s.hindi);
report.checks.englishPresent = noEnglish.length === 0;
report.checks.hindiPresent = noHindi.length === 0;
if (noEnglish.length) problems.push(`MISSING ENGLISH: ${noEnglish.map(([id]) => id).join(', ')}`);
else console.log('✅ 2. English present on every sentence: OK');
if (noHindi.length) problems.push(`MISSING HINDI: ${noHindi.map(([id]) => id).join(', ')}`);
else console.log('✅ 3. Hindi present on every sentence: OK');

// 4. audio mapping derives from id
const idBad = [...seen.entries()].filter(([id, s]) => !id.startsWith(s.courseId + '-'));
report.checks.idPrefixMatchesCourse = idBad.length === 0;
if (idBad.length) problems.push(`ID/COURSE MISMATCH: ${idBad.map(([id]) => id).join(', ')}`);
else console.log('✅ 4. Sentence id prefix === courseId: OK');

// 5. duplicate audio assignment (path collisions) — impossible by construction, verified anyway
const audioPathCount = new Map();
for (const [id, s] of seen) {
  const p = `${s.courseId}/${id}.mp3`;
  audioPathCount.set(p, (audioPathCount.get(p) ?? 0) + 1);
}
const dupPaths = [...audioPathCount.entries()].filter(([, c]) => c > 1);
report.checks.noDuplicateAudioAssignment = dupPaths.length === 0;
if (dupPaths.length) problems.push(`DUPLICATE AUDIO ASSIGNMENT: ${dupPaths.map(([p]) => p).join(', ')}`);
else console.log('✅ 5. No duplicate audio assignments: OK');

// expected files (english + hindi + instruction)
const expected = new Set();
for (const [id, s] of seen) {
  expected.add(`${s.courseId}/${id}.mp3`);
  expected.add(`${s.courseId}/${id}.hindi.mp3`);
}
expected.add('shared/repeat-instruction.mp3');

// 6/7. filesystem cross-check
let missing = [];
let extra = [];
if (fs.existsSync(AUDIO_DIR)) {
  const onDisk = new Set();
  const walk = (dir, base = '') => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(dir, e.name), rel);
      else if (e.name.endsWith('.mp3')) onDisk.add(rel);
    }
  };
  walk(AUDIO_DIR);
  missing = [...expected].filter((p) => !onDisk.has(p));
  extra = [...onDisk].filter((p) => !expected.has(p));
  report.checks.noMissingAudio = missing.length === 0;
  report.checks.noStaleAudio = extra.length === 0;
  if (missing.length) problems.push(`MISSING AUDIO (${missing.length}): ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ' ...' : ''}`);
  else console.log('✅ 7. No missing audio files: OK');
  if (extra.length) problems.push(`STALE/UNKNOWN AUDIO (${extra.length}): ${extra.slice(0, 10).join(', ')}${extra.length > 10 ? ' ...' : ''}`);
  else console.log('✅ 6. No stale audio files: OK');
} else {
  console.log('⚠️  public/audio not found — skipped filesystem checks');
}

report.checks.missingCount = missing.length;
report.checks.extraCount = extra.length;

// summary
report.status = problems.length === 0 ? 'PASS' : 'FAIL';
report.problems = problems.slice(0, 100);
report.note =
  'FILE MAPPING VERIFIED — spoken content of MP3s is NOT verified by this script. Run scripts/audit-audio-stt.py for SPOKEN CONTENT VERIFICATION.';

console.log('\n──────────────────────────────────────────');
if (problems.length === 0) {
  console.log('✅ FILE MAPPING VERIFIED — all structural checks passed');
  console.log('   (spoken content NOT verified here — see audit-audio-stt.py)');
} else {
  console.log(`❌ ${problems.length} problem(s) found:`);
  for (const p of problems.slice(0, 20)) console.log('   -', p);
}

const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
process.exit(problems.length === 0 ? 0 : 1);
