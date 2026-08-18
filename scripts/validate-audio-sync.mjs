/**
 * validate-audio-sync.mjs
 *
 * Validates that every sentence in the seed data has a corresponding MP3 file
 * in public/audio/ and that the sentence IDs are consistent.
 *
 * Run: node scripts/validate-audio-sync.mjs
 *
 * Exits with code 1 if any mismatches are found.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const audioDir = resolve(root, 'public', 'audio');

// Load sentences.json (must be regenerated from seed data first)
const sentencesPath = resolve(root, 'scripts', 'sentences.json');
let sentences;
try {
  sentences = JSON.parse(readFileSync(sentencesPath, 'utf8'));
} catch {
  console.error(`❌ Cannot read ${sentencesPath}`);
  console.error('   Run: npx tsx scripts/export-sentences.mts > scripts/sentences.json');
  process.exit(1);
}

// Also load trial sentences
const trialPath = resolve(root, 'scripts', 'trial-sentences.json');
let trial = [];
try {
  trial = JSON.parse(readFileSync(trialPath, 'utf8'));
} catch {
  console.warn('⚠️  No trial-sentences.json found, skipping trial validation');
}
const allSentences = [...sentences, ...trial];

let errors = 0;
let warnings = 0;
const seenIds = new Set();

console.log(`\n🔍 Validating ${allSentences.length} sentences against audio files...\n`);

for (const s of allSentences) {
  // Check required fields
  if (!s.id) {
    console.error(`❌ Sentence missing ID: ${JSON.stringify(s)}`);
    errors++;
    continue;
  }
  if (!s.english || s.english.trim() === '') {
    console.error(`❌ [${s.id}] Missing english text`);
    errors++;
    continue;
  }

  // Check for duplicate IDs
  if (seenIds.has(s.id)) {
    console.error(`❌ Duplicate sentence ID: ${s.id}`);
    errors++;
  }
  seenIds.add(s.id);

  // Check that MP3 file exists
  const mp3Path = resolve(audioDir, `${s.id}.mp3`);
  if (!existsSync(mp3Path)) {
    console.error(`❌ [${s.id}] Missing audio file: ${s.id}.mp3`);
    errors++;
    continue;
  }

  // Check that MP3 file is non-trivial (> 1KB indicates real audio content)
  const stat = statSync(mp3Path);
  if (stat.size < 1000) {
    console.warn(`⚠️  [${s.id}] Audio file seems too small (${stat.size} bytes) — might be empty`);
    warnings++;
  }

  // Check that the sentence ID follows the expected pattern
  const validPatterns = [
    /^(kids|school|beginner|intermediate|advanced|daily|interview|corporate|business|travel)-l\d+-s\d+$/,
    /^trial-\d+$/,
  ];
  if (!validPatterns.some((p) => p.test(s.id))) {
    console.warn(`⚠️  [${s.id}] Unusual ID format — expected pattern like "beginner-l1-s1" or "trial-1"`);
    warnings++;
  }
}

// Check for orphaned MP3 files (files that exist but don't correspond to any sentence)
const sentenceIds = new Set(allSentences.map((s) => s.id));
import { readdirSync } from 'node:fs';
if (existsSync(audioDir)) {
  const mp3Files = readdirSync(audioDir).filter((f) => f.endsWith('.mp3'));
  for (const file of mp3Files) {
    const id = file.replace('.mp3', '');
    if (!sentenceIds.has(id)) {
      console.warn(`⚠️  Orphaned audio file: ${file} — no matching sentence found`);
      warnings++;
    }
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${allSentences.length} sentences checked`);
console.log(`  ✅ Audio files: ${allSentences.length - errors} found`);
console.log(`  ❌ Errors: ${errors}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log(`${'─'.repeat(60)}\n`);

if (errors > 0) {
  console.error('💥 Validation FAILED — fix the errors above before deploying!\n');
  process.exit(1);
} else {
  console.log('✅ Validation PASSED — all sentences have matching audio.\n');
  process.exit(0);
}
