/**
 * SunoBolo — Curriculum Duplicate Detector
 * Run: node scripts/check-duplicates.js
 * Checks for duplicate English sentences across all 30 days.
 */
const fs = require('fs');
const path = require('path');

const curriculumPath = path.join(__dirname, '..', 'src', 'data', 'journey-curriculum.ts');
const tensesPath = path.join(__dirname, '..', 'src', 'data', 'tenses.ts');

const curriculum = fs.readFileSync(curriculumPath, 'utf8');
const tenses = fs.readFileSync(tensesPath, 'utf8');

// ── Normalize for comparison ──
function norm(s) {
  return s
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[.,!?;:]/g, '')
    .replace(/\\/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Extract all English sentences from curriculum steps ──
// We look for english: '...' in the curriculum
const stepEnRegex = /english:\s*'((?:[^'\\]|\\.)*)'/g;
const allStepEn = [];
let m;
while ((m = stepEnRegex.exec(curriculum)) !== null) {
  const text = m[1].replace(/\\'/g, "'");
  const lineNum = curriculum.substring(0, m.index).split('\n').length;
  // Determine which day by looking backwards for day: N
  let dayNum = 0;
  const before = curriculum.substring(0, m.index);
  const dayMatches = [...before.matchAll(/\bday:\s*(\d+)/g)];
  if (dayMatches.length > 0) {
    dayNum = parseInt(dayMatches[dayMatches.length - 1][1]);
  }
  allStepEn.push({ text, norm: norm(text), line: lineNum, day: dayNum });
}

// ── Extract quiz question options ──
const optsRegex = /options:\s*\[((?:[^\]]|\](?!;))*)\]/g;
const allQuizOpts = [];
while ((m = optsRegex.exec(curriculum)) !== null) {
  const optsStr = m[1];
  const opts = [...optsStr.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(o => o[1].replace(/\\'/g, "'"));
  const lineNum = curriculum.substring(0, m.index).split('\n').length;
  let dayNum = 0;
  const before = curriculum.substring(0, m.index);
  const dayMatches = [...before.matchAll(/\bday:\s*(\d+)/g)];
  if (dayMatches.length > 0) {
    dayNum = parseInt(dayMatches[dayMatches.length - 1][1]);
  }
  for (const opt of opts) {
    allQuizOpts.push({ text: opt, norm: norm(opt), line: lineNum, day: dayNum });
  }
}

// ── Extract all sentences from tenses.ts examples ──
const tenseExRegex = /en:\s*'((?:[^'\\]|\\.)*)'/g;
const allTenseEn = [];
while ((m = tenseExRegex.exec(tenses)) !== null) {
  const text = m[1].replace(/\\'/g, "'");
  allTenseEn.push({ text, norm: norm(text) });
}

// ── Find duplicates in step english sentences ──
console.log('=== DUPLICATE DETECTION REPORT ===\n');

const seen = new Map(); // norm -> [{text, day, line}]
let dupCount = 0;

for (const item of allStepEn) {
  if (!seen.has(item.norm)) {
    seen.set(item.norm, []);
  }
  seen.get(item.norm).push(item);
}

console.log('--- Step English Sentence Duplicates ---');
for (const [n, occurrences] of seen) {
  if (occurrences.length > 1) {
    dupCount++;
    console.log(`\n  DUP #${dupCount} (${occurrences.length}x): "${occurrences[0].text}"`);
    for (const occ of occurrences) {
      console.log(`    Day ${occ.day}, Line ${occ.line}`);
    }
  }
}
if (dupCount === 0) console.log('  ✅ No duplicate step sentences found!');

// ── Check step sentences vs quiz options ──
console.log('\n--- Step Sentences Used as Quiz Options ---');
let quizReuse = 0;
for (const opt of allQuizOpts) {
  for (const step of allStepEn) {
    if (opt.norm === step.norm && opt.day === step.day) {
      quizReuse++;
      console.log(`  Day ${opt.day}: Quiz option "${opt.text}" is same as step sentence (Line ${step.line})`);
    }
  }
}
if (quizReuse === 0) console.log('  ✅ No step sentences reused as same-day quiz options!');

// ── Cross-day duplicate check ──
console.log('\n--- Cross-Day Duplicate Sentences ---');
let crossDayDup = 0;
const dayGroups = new Map();
for (const item of allStepEn) {
  if (item.day === 0) continue;
  if (!dayGroups.has(item.day)) dayGroups.set(item.day, new Map());
  dayGroups.get(item.day).set(item.norm, item);
}

// Check each sentence across different days
const allNorms = new Map(); // norm -> [{day, text, line}]
for (const [day, sentences] of dayGroups) {
  for (const [n, item] of sentences) {
    if (!allNorms.has(n)) allNorms.set(n, []);
    allNorms.get(n).push({ day, text: item.text, line: item.line });
  }
}
for (const [n, occurrences] of allNorms) {
  const uniqueDays = new Set(occurrences.map(o => o.day));
  if (uniqueDays.size > 1) {
    crossDayDup++;
    console.log(`\n  CROSS-DUP: "${occurrences[0].text}"`);
    for (const occ of occurrences) {
      console.log(`    Day ${occ.day}, Line ${occ.line}`);
    }
  }
}
if (crossDayDup === 0) console.log('  ✅ No cross-day duplicate sentences!');

// ── Summary ──
console.log('\n=== SUMMARY ===');
console.log(`Total step sentences analyzed: ${allStepEn.length}`);
console.log(`Unique step sentences: ${seen.size}`);
console.log(`Within-day duplicates: ${dupCount}`);
console.log(`Cross-day duplicates: ${crossDayDup}`);
console.log(`Quiz options reusing same-day step sentences: ${quizReuse}`);
console.log(`Total issues: ${dupCount + crossDayDup + quizReuse}`);
