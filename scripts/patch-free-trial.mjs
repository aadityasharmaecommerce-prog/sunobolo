import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/pages/FreeTrialPage.tsx';
let c = readFileSync(file, 'utf8');

// 1. Add import for free trial sentences
if (!c.includes("freeTrialSentences")) {
  c = c.replace(
    "import type { Sentence } from '@/types';",
    "import type { Sentence } from '@/types';\nimport { freeTrialSentences } from '@/data/seed/free-trial';"
  );
}

// 2. Remove seedData import
c = c.replace("import { seedData } from '@/data/seed';\n", '');

// 3. Replace getTrialSentences function
const oldFn = c.substring(
  c.indexOf('/** Pick the first'),
  c.indexOf('return free.slice(0, TRIAL_TOTAL);') + 'return free.slice(0, TRIAL_TOTAL);'.length + '\n}'.length + 1
);

const newFn = `/** First 25 curated free trial sentences. */
function getTrialSentences(): Sentence[] {
  return freeTrialSentences.map((s, i) => ({
    id: 'trial-' + (i + 1),
    lessonId: 'trial',
    courseId: 'trial',
    english: s.english,
    hindi: s.hindi,
    difficulty: s.difficulty,
    order: i + 1,
    isFree: true,
  }));
}`;

c = c.replace(oldFn, newFn);

writeFileSync(file, c);
console.log('patched FreeTrialPage');
