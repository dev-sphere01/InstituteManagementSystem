import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ThemeProvider from './components/common/ThemeProvider'
import NavigationGuard from './components/NavigationGuard'

// Routes
import AuthProtectedRoutes from './routes/AuthProtectedRoutes'
import RoleBasedRoutes from './routes/RoleBasedRoutes'

// Pages
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Enquiry Pages
import EnquiryForm from './pages/enquiry/EnquiryForm.jsx'

// Auth Pages
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import AuthSuccess from './pages/auth/AuthSuccess.jsx'
import AuthFailed from './pages/auth/AuthFailed.jsx'

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard.jsx'
import Reports from './pages/reports/Reports.jsx'
import Settings from './pages/user/components/Settings.jsx'

// Masters Pages
import { User } from './pages/masters/user/User.jsx'
import Role from './pages/masters/role/Role.jsx'
import Courses from './pages/masters/courses/Courses.jsx'
import Batch from './pages/masters/batch/Batch.jsx'
import Session from './pages/masters/session/Session.jsx'

// Student Pages
import Student from './pages/student/Student.jsx'


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <NavigationGuard />
          <Routes>
            {/* Auth-protected routes - prevents logged-in users from accessing auth pages */}
            <Route path="/" element={<AuthProtectedRoutes />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="auth-success" element={<AuthSuccess />} />
              <Route path="auth-failed" element={<AuthFailed />} />
            </Route>

            {/* Role-based protected routes */}
            <Route path="/dashboard" element={<RoleBasedRoutes />}>
              {/* Admin Dashboard */}
              <Route index element={<Dashboard />} />

              {/* Student Dashboard */}
              <Route path="student" element={<Student />} />

              {/* Admin Routes */}
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />

              {/* Masters Routes */}
              <Route path="users" element={<User />} />
              <Route path="roles" element={<Role />} />
              <Route path="courses" element={<Courses />} />
              <Route path="batches" element={<Batch />} />
              <Route path="sessions" element={<Session />} />

              {/* Enquiry Routes */}
              <Route path="enquiry" element={<EnquiryForm />} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
