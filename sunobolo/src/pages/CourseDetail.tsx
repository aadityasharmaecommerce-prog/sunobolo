import { useParams, useNavigate } from 'react-router-dom';
import { allCourses } from '../data/content';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = allCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <span className="text-4xl">🔍</span>
        <h2 className="text-xl font-bold text-gray-900 mt-4">Course not found</h2>
        <p className="text-gray-500 mt-1">The course you are looking for does not exist.</p>
        <button onClick={() => navigate('/courses')} className="btn-primary btn-md mt-6">
          Browse Courses
        </button>
      </div>
    );
  }

  const completedLessons = 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Course Header */}
      <div className="card p-6 bg-gradient-to-br from-brand-500 to-accent-500 text-white border-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            {course.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            <p className="text-white/70 text-sm">{course.difficulty} · {course.totalLessons} lessons</p>
          </div>
        </div>
        <p className="text-white/80 text-sm">{course.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
          <span>{course.totalSentences} sentences</span>
          <span>·</span>
          <span>~{course.estimatedHours} hours</span>
        </div>
        {course.isFree && (
          <div className="mt-3 inline-flex bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
            Free Course
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Your Progress</h2>
          <span className="text-sm text-gray-500">{completedLessons} / {course.totalLessons} lessons</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(completedLessons / course.totalLessons) * 100}%` }} />
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Lessons</h2>
        <div className="space-y-2">
          {course.lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => navigate(`/lesson/${course.id}/${lesson.id}`)}
              className="w-full card p-4 text-left hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  idx < completedLessons
                    ? 'bg-success-100 text-success-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {idx < completedLessons ? '✓' : String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{lesson.sentences.length} sentences · ~{lesson.estimatedMinutes} min</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}