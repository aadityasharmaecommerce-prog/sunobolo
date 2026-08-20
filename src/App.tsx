import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
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
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminMemberDetail from './pages/admin/MemberDetail';
import AdminPayments from './pages/admin/Payments';
import AdminReports from './pages/admin/Reports';

export default function App() {
  return (
    <AuthProvider>
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
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failure" element={<PaymentFailure />} />
        </Route>
        {/* Admin Panel — separate layout, server-side auth */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="members/:id" element={<AdminMemberDetail />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
