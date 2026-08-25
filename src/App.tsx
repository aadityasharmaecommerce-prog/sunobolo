import { lazy, Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import SplashScreen from './components/SplashScreen';
import ScrollToTop from './components/ScrollToTop';
import LoadingFallback from './components/LoadingFallback';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import FreeTrial from './pages/FreeTrial';
import ProgressPage from './pages/ProgressPage';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Reading from './pages/Reading';
import ReadingArticle from './pages/ReadingArticle';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import RefundPolicy from './pages/RefundPolicy';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded Tenses pages (separate chunk)
const Tenses = lazy(() => import('./pages/Tenses'));
const TenseLesson = lazy(() => import('./pages/TenseLesson'));
const Journey = lazy(() => import('./pages/Journey'));
const JourneyDay = lazy(() => import('./pages/JourneyDay'));

/**
 * Wrapper that forces JourneyDay to remount when dayNumber changes.
 * This prevents stale state (dayComplete, stepIdx, etc.) from persisting
 * across day transitions — the root cause of "Day 2 shows Complete immediately".
 */
function JourneyDayWrapper() {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  return <JourneyDay key={dayNumber} />;
}

export default function App() {
  return (
    <AuthProvider>
      <SplashScreen />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="course/:courseId" element={<CourseDetail />} />
          <Route path="lesson/:courseId/:lessonId" element={<Lesson />} />
          <Route path="free-trial" element={<FreeTrial />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
          <Route path="reset-password" element={<Login />} />
          <Route path="tenses" element={<ErrorBoundary><Suspense fallback={<LoadingFallback text="Loading Grammar..." />}><Tenses /></Suspense></ErrorBoundary>} />
          <Route path="tenses/:tenseId" element={<ErrorBoundary><Suspense fallback={<LoadingFallback text="Loading Lesson..." />}><TenseLesson /></Suspense></ErrorBoundary>} />
          <Route path="journey" element={<ErrorBoundary><Suspense fallback={<LoadingFallback text="Loading Journey..." />}><Journey /></Suspense></ErrorBoundary>} />
          <Route path="journey/:dayNumber" element={<ErrorBoundary><Suspense fallback={<LoadingFallback text="Loading Day..." />}><JourneyDayWrapper /></Suspense></ErrorBoundary>} />
          <Route path="reading" element={<Reading />} />
          <Route path="reading/:id" element={<ReadingArticle />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failure" element={<PaymentFailure />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
