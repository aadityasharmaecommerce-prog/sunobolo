/**
 * Split content.ts into lazy-loaded course chunks
 * 
 * Strategy:
 * - src/data/content/types.ts        — shared TypeScript interfaces
 * - src/data/content/free-trial.ts   — freeTrialLesson
 * - src/data/content/beginner.ts     — beginnerCourse
 * - src/data/content/intermediate.ts — intermediateCourse
 * - ... (one per course)
 * - src/data/content/index.ts        — lightweight metadata + lazy loaders
 * 
 * The original content.ts is preserved as backup.
 */

const fs = require('fs');
const path = require('path');

const contentFile = path.join(__dirname, '../src/data/content.ts');
const content = fs.readFileSync(contentFile, 'utf8');
const lines = content.split('\n');

// Find all course export boundaries
const courseExports = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/export const \w+Course: CourseData = \{/)) {
    const name = lines[i].match(/export const (\w+)Course/)[1];
    courseExports.push({ name, line: i });
  }
}

const freeTrialLine = lines.findIndex(l => l.includes('export const freeTrialLesson'));
const allCoursesLine = lines.findIndex(l => l.includes('export const allCourses: CourseData[]'));

// Interface definitions (first 31 lines)
const interfaces = lines.slice(0, 31).join('\n');

// freeTrialLesson data
const freeTrialData = lines.slice(freeTrialLine, courseExports[0].line).join('\n');

// Create content directory
const dir = path.join(__dirname, '../src/data/content');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Write types.ts
fs.writeFileSync(path.join(dir, 'types.ts'), interfaces + '\n');
console.log('Created: content/types.ts');

// 2. Write free-trial.ts
fs.writeFileSync(path.join(dir, 'free-trial.ts'), freeTrialData + '\n');
console.log('Created: content/free-trial.ts');

// 3. Write each course
courseExports.forEach((course, i) => {
  const start = course.line;
  const end = i + 1 < courseExports.length ? courseExports[i + 1].line : allCoursesLine;
  const courseData = lines.slice(start, end).join('\n');
  const filename = course.name.replace('_', '-');
  fs.writeFileSync(path.join(dir, filename + '.ts'), courseData + '\n');
  console.log('Created: content/' + filename + '.ts');
});

// 4. Build metadata for index.ts
const metadataEntries = courseExports.map((course, i) => {
  const start = course.line;
  const end = i + 1 < courseExports.length ? courseExports[i + 1].line : allCoursesLine;
  const courseText = lines.slice(start, end).join('\n');

  function extract(field, regex) {
    const m = courseText.match(regex);
    return m ? m[1] : field;
  }

  const id = extract(course.name, /"id":\s*"([^"]+)"/);
  const title = extract(course.name, /"title":\s*"([^"]+)"/);
  const description = extract('', /"description":\s*"([^"]+)"/);
  const shortDescription = extract('', /"shortDescription":\s*"([^"]+)"/);
  const icon = extract('📘', /"icon":\s*"([^"]+)"/);
  const color = extract('brand', /"color":\s*"([^"]+)"/);
  const difficulty = extract('Beginner', /"difficulty":\s*"([^"]+)"/);
  const totalSentences = parseInt(extract('0', /"totalSentences":\s*(\d+)/));
  const totalLessons = parseInt(extract('0', /"totalLessons":\s*(\d+)/));
  const estimatedHours = parseInt(extract('0', /"estimatedHours":\s*(\d+)/));
  const isFree = extract('false', /"isFree":\s*(\w+)/) === 'true';
  const priceMatch = courseText.match(/"price":\s*"([^"]+)"/);
  const price = priceMatch ? priceMatch[1] : undefined;

  return { id, title, description, shortDescription, icon, color, difficulty, totalSentences, totalLessons, estimatedHours, isFree, price };
});

// Escape single quotes for JS string
function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// 5. Write index.ts
const indexContent = `import type { CourseData } from './types';
import { freeTrialLesson } from './free-trial';

// ============================================
// COURSE METADATA INDEX — Lightweight
// Actual sentence data is lazy-loaded per course
// ============================================

const courseLoaders: Record<string, () => Promise<{ default: CourseData }>> = {
  'beginner': () => import('./beginner'),
  'intermediate': () => import('./intermediate'),
  'advanced': () => import('./advanced'),
  'daily-life': () => import('./daily-life'),
  'interview': () => import('./interview'),
  'corporate': () => import('./corporate'),
  'business': () => import('./business'),
  'travel': () => import('./travel'),
  'school': () => import('./school'),
  'kids': () => import('./kids'),
};

// Cache loaded courses
const loadedCourses = new Map<string, CourseData>();

export async function loadCourse(courseId: string): Promise<CourseData | null> {
  if (loadedCourses.has(courseId)) {
    return loadedCourses.get(courseId)!;
  }
  const loader = courseLoaders[courseId];
  if (!loader) return null;
  try {
    const mod = await loader();
    const course = mod.default || mod[Object.keys(mod)[0]];
    loadedCourses.set(courseId, course);
    return course;
  } catch (e) {
    console.error('Failed to load course:', courseId, e);
    return null;
  }
}

// Lightweight course metadata (no sentence data)
export const courseMetadata = [
${metadataEntries.map(m => `  {
    id: '${esc(m.id)}',
    title: '${esc(m.title)}',
    description: '${esc(m.description)}',
    shortDescription: '${esc(m.shortDescription)}',
    icon: '${esc(m.icon)}',
    color: '${esc(m.color)}',
    difficulty: '${esc(m.difficulty)}',
    targetAudience: [],
    totalSentences: ${m.totalSentences},
    totalLessons: ${m.totalLessons},
    estimatedHours: ${m.estimatedHours},
    isFree: ${m.isFree},${m.price ? `\n    price: '${esc(m.price)}',` : ''}
  }`).join(',\n')}
];

// Backward compatibility: allCourses (empty — use loadCourse() instead)
export const allCourses: CourseData[] = [];

export { freeTrialLesson };
export type { CourseData };
export { courseLoaders };
`;

fs.writeFileSync(path.join(dir, 'index.ts'), indexContent);
console.log('Created: content/index.ts');

console.log('\n=== SPLIT COMPLETE ===');
console.log('Files created in src/data/content/:');
const files = fs.readdirSync(dir);
files.forEach(f => {
  const stats = fs.statSync(path.join(dir, f));
  console.log('  ' + f + ' (' + Math.round(stats.size / 1024) + ' KB)');
});
