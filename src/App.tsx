import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Lazy-loaded Tenses pages (separate chunk)
const Tenses = lazy(() => import('./pages/Tenses'));
const TenseLesson = lazy(() => import('./pages/TenseLesson'));
const Journey = lazy(() => import('./pages/Journey'));
const JourneyDay = lazy(() => import('./pages/JourneyDay'));

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
          <Route path="tenses" element={<Suspense fallback={<LoadingFallback text="Loading Grammar..." />}><Tenses /></Suspense>} />
          <Route path="tenses/:tenseId" element={<Suspense fallback={<LoadingFallback text="Loading Lesson..." />}><TenseLesson /></Suspense>} />
          <Route path="journey" element={<Suspense fallback={<LoadingFallback text="Loading Journey..." />}><Journey /></Suspense>} />
          <Route path="journey/:dayNumber" element={<Suspense fallback={<LoadingFallback text="Loading Day..." />}><JourneyDay /></Suspense>} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failure" element={<PaymentFailure />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
