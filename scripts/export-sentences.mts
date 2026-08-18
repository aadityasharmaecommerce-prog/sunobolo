/**
 * Exports every sentence (id + english) from the seed data to JSON,
 * so the Python edge-tts script can generate the voice pack.
 * Usage: npx tsx scripts/export-sentences.mts > /tmp/sb-sentences.json
 */
import { seedData } from '../src/data/seed';

const { sentences } = seedData;
const rows = sentences
  .map((s) => ({ id: s.id, english: s.english }))
  .sort((a, b) => a.id.localeCompare(b.id));

console.log(JSON.stringify(rows));
console.error(`exported ${rows.length} sentences`);
