import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
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
      </Route>
    </Routes>
  );
}