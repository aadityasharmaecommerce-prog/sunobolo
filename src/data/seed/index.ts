import type { Course, Lesson, Sentence, SentenceRow } from '@/types';
import { coursesSeed } from './courses';
import { kidsSentences } from './sentences-kids';
import { schoolSentences } from './sentences-school';
import { beginnerSentences } from './sentences-beginner';
import { intermediateSentences } from './sentences-intermediate';
import { advancedSentences } from './sentences-advanced';
import { dailySentences } from './sentences-daily';
import { interviewSentences } from './sentences-interview';
import { corporateSentences } from './sentences-corporate';
import { businessSentences } from './sentences-business';
import { travelSentences } from './sentences-travel';
import { packagesSeed } from './packages';
import { usersSeed } from './users';

const sentenceMap: Record<string, SentenceRow[]> = {
  kids: kidsSentences,
  school: schoolSentences,
  beginner: beginnerSentences,
  intermediate: intermediateSentences,
  advanced: advancedSentences,
  daily: dailySentences,
  interview: interviewSentences,
  corporate: corporateSentences,
  business: businessSentences,
  travel: travelSentences,
};

export interface SeedData {
  courses: Course[];
  lessons: Lesson[];
  sentences: Sentence[];
}

/**
 * Builds the full seed dataset.
 *
 * Sentence ids are stable and human readable (`beginner-l1-s3`) so that
 * Phase 2 can seed D1 with the same data without re-keying anything.
 */
function build(): SeedData {
  const lessons: Lesson[] = [];
  const sentences: Sentence[] = [];

  const courses: Course[] = coursesSeed.map((seed) => {
    const rows = sentenceMap[seed.id] ?? [];
    const lessonsMeta = seed.lessons;
    let cursor = 0;
    let totalSentences = 0;

    lessonsMeta.forEach((lm, li) => {
      const lessonId = `${seed.id}-l${li + 1}`;
      const lessonRows = rows.slice(cursor, cursor + lm.sentenceCount);
      cursor += lm.sentenceCount;
      totalSentences += lessonRows.length;

      lessons.push({
        id: lessonId,
        courseId: seed.id,
        title: lm.title,
        emoji: lm.emoji,
        description: lm.description,
        order: li + 1,
        isFree: lm.isFree ?? seed.isFree ?? false,
        sentenceCount: lessonRows.length,
      });

      lessonRows.forEach((row, si) => {
        const [english, hindi, difficulty, isFree] = row;
        sentences.push({
          id: `${lessonId}-s${si + 1}`,
          lessonId,
          courseId: seed.id,
          english,
          hindi,
          difficulty,
          order: si + 1,
          isFree: isFree ?? lm.isFree ?? seed.isFree ?? false,
        });
      });
    });

    return {
      id: seed.id,
      slug: seed.slug,
      title: seed.title,
      tagline: seed.tagline,
      description: seed.description,
      longDescription: seed.longDescription,
      level: seed.level,
      audience: seed.audience,
      emoji: seed.emoji,
      color: seed.color,
      isFree: seed.isFree ?? false,
      order: seed.order,
      lessonCount: lessonsMeta.length,
      sentenceCount: totalSentences,
      featured: seed.featured ?? false,
      seo: seed.seo,
    };
  });

  return { courses, lessons, sentences };
}

export const seedData: SeedData = build();
export { packagesSeed, usersSeed };
