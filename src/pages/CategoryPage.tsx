import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Course } from '@/types';
import { CATEGORY_PAGES, ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProgress } from '@/context/ProgressContext';
import { coursesService } from '@/services/coursesService';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingState, ErrorState } from '@/components/ui/States';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const def = CATEGORY_PAGES.find((p) => p.slug === slug);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getCourseProgress } = useProgress();

  usePageMeta(def?.title ?? 'SunoBolo English', def?.description, slug);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const all = await coursesService.getCourses();
        if (cancelled) return;
        if (def) {
          setCourses(all.filter((c) => c.level === def.level || c.slug === def.slug));
        } else {
          // Overview pages: show everything.
          setCourses(all);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [def]);

  if (!def && !loading && !error) {
    return (
      <div className="container section">
        <div className="state">
          <span className="state__emoji" aria-hidden="true">🧭</span>
          <h1>Page nahi mila</h1>
          <p>Yeh category exist nahi karti. Saare courses dekhne ke liye neeche click karo.</p>
          <Button to={ROUTES.courses}>All Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="category-hero">
        <div className="container">
          <p className="eyebrow">SunoBolo English</p>
          <h1>{def?.heading ?? 'English Speaking Practice'}</h1>
          <p>{def?.description}</p>
          <div className="hero__cta mt-3" style={{ justifyContent: 'center' }}>
            <Button to={ROUTES.onboarding} size="lg">START FREE</Button>
          </div>
        </div>
      </section>

      <div className="container">
        <Section eyebrow="Courses" title="Is category ke courses" align="left">
          {loading ? (
            <LoadingState label="Courses load ho rahe hain…" />
          ) : error ? (
            <ErrorState onRetry={() => window.location.reload()} />
          ) : (
            <div className="home-courses">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} progress={getCourseProgress(course.id)} />
              ))}
            </div>
          )}
        </Section>

        <Section eyebrow="Method" title="Kaise kaam karta hai" align="center">
          <div className="steps">
            <div className="step">
              <span className="step__num">01</span>
              <div className="step__emoji" aria-hidden="true">🔊</div>
              <h3>Suno</h3>
              <p>Sentence ko 3 baar suno.</p>
            </div>
            <div className="step">
              <span className="step__num">02</span>
              <div className="step__emoji" aria-hidden="true">🎤</div>
              <h3>Bolo</h3>
              <p>Sentence ko 3 baar bolo.</p>
            </div>
            <div className="step">
              <span className="step__num">03</span>
              <div className="step__emoji" aria-hidden="true">➡️</div>
              <h3>Repeat & Improve</h3>
              <p>Next sentence par jao.</p>
            </div>
          </div>
        </Section>

        <Section>
          <div className="cta-banner">
            <h2>Aaj hi 10 minute ki practice karo</h2>
            <p>Pehla lesson free hai — koi card nahi, koi registration nahi.</p>
            <Button to={ROUTES.onboarding} size="lg" variant="secondary">START FREE →</Button>
          </div>
        </Section>
      </div>
    </div>
  );
}
