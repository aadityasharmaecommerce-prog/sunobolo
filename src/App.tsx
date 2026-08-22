import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import SplashScreen from './components/SplashScreen';
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

export default function App() {
  return (
    <AuthProvider>
      <SplashScreen />
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
          <Route path="tenses" element={<Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>}><Tenses /></Suspense>} />
          <Route path="tenses/:tenseId" element={<Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>}><TenseLesson /></Suspense>} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failure" element={<PaymentFailure />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
