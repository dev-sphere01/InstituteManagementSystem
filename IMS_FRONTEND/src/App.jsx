import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./components/common/ThemeProvider";
import NavigationGuard from "./components/NavigationGuard";
import { NotificationProvider } from "./services/NotificationService";

// Routes
import AuthProtectedRoutes from "./routes/AuthProtectedRoutes";
import RoleBasedRoutes from "./routes/RoleBasedRoutes";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Enquiry Pages
import EnquiryForm from "./pages/enquiry/addEnquiry/EnquiryForm.jsx";
import ViewEnquiry from "./pages/enquiry/viewEnquiry/ViewEnquiry.jsx";
import EnquiryDetails from "./pages/enquiry/viewEnquiry/components/EnquiryDetails.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import AuthSuccess from "./pages/auth/AuthSuccess.jsx";
import AuthFailed from "./pages/auth/AuthFailed.jsx";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Settings from "./pages/user/components/Settings.jsx";
import ChangePassword from "./pages/user/components/ChangePassword.jsx";

// Masters Pages
import { User } from "./pages/masters/user/User.jsx";
import Role from "./pages/masters/role/Role.jsx";
import Courses from "./pages/masters/courses/Courses.jsx";
import Batch from "./pages/masters/batch/Batch.jsx";
import Session from "./pages/masters/session/Session.jsx";
import InstitutionType from "./pages/masters/institutionType/InstitutionType.jsx";
import CenterCode from "./pages/masters/centerCode/CenterCode.jsx";

// Student Pages
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import Admission from "./pages/admission/createAdmissions/Admission.jsx";
import WorkflowDashboard from "./pages/workflow/WorkflowDashboard.jsx";
import Fee from "./pages/fee/Fee.jsx";

import StudentDetails from "./pages/student/AllStudents/StudentDetails.jsx";
import StudentProfile from "./pages/student/StudentProfile/StudentProfile.jsx";
import AddistionalFeatures from "./pages/masters/additionalFeatures/AdditionalFeatures.jsx";

// Employee Module
import Employee from "./pages/employee/Employee.jsx";

// Payroll Module
import Payroll from "./pages/payroll/Payroll.jsx";

// CRM Module
import LeadPipeline from "./pages/crm/leads/LeadPipeline.jsx";
import CrmAnalytics from "./pages/crm/analytics/CrmAnalytics.jsx";
import Campaigns from "./pages/crm/campaigns/Campaigns.jsx";

// Public Pages
import ContactUs from "./pages/public/ContactUs.jsx";


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <NavigationGuard />
            <Routes>
              {/* Auth-protected routes - prevents logged-in users from accessing auth pages */}
              <Route path="/" element={<AuthProtectedRoutes />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route
                  path="reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="auth-success" element={<AuthSuccess />} />
                <Route path="auth-failed" element={<AuthFailed />} />
                {/* Removed change-password from here */}
              </Route>

              {/* Role-based protected routes */}
              <Route path="/dashboard" element={<RoleBasedRoutes />}>
                {/* Admin Dashboard */}
                <Route index element={<Dashboard />} />

                {/* Student Dashboard */}
                <Route path="student" element={<StudentDashboard />} />

                {/* Admin Routes */}
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />

                {/* Masters Routes */}
                <Route path="users" element={<User />} />
                <Route path="roles" element={<Role />} />
                <Route path="courses" element={<Courses />} />
                <Route path="batches" element={<Batch />} />
                <Route path="center-code" element={<CenterCode />} />
                <Route path="sessions" element={<Session />} />
                <Route path="institution-type" element={<InstitutionType />} />
                <Route path="additional-features" element={<AddistionalFeatures />} />

                {/* Enquiry Routes */}
                <Route path="enquiry/create" element={<EnquiryForm />} />
                <Route path="enquiry/view" element={<ViewEnquiry />} />
                <Route
                  path="enquiry/details/:id"
                  element={<EnquiryDetails />}
                />

                {/* Admission Routes */}
                <Route path="admission" element={<Admission />} />

                {/* Workflow Routes */}
                <Route path="workflow" element={<WorkflowDashboard />} />

                {/* Fee Routes */}
                <Route path="Fee" element={<Fee />} />

                {/* Change Password - now protected */}
                <Route path="change-password" element={<ChangePassword />} />

                {/* Student Details Table */}
                <Route path="student-details" element={<StudentDetails />} />

                {/* Exam Details and Student Performance */}
                <Route
                  path="student-details/:id"
                  element={<StudentProfile />}
                />

                {/* Employee Module */}
                <Route path="employees" element={<Employee />} />
                <Route path="employees/:view" element={<Employee />} />
                <Route path="employees/:view/:id" element={<Employee />} />

                {/* Payroll Module */}
                <Route path="payroll" element={<Payroll />} />
                <Route path="payroll/:tab" element={<Payroll />} />

                {/* CRM Module */}
                <Route path="crm/leads" element={<LeadPipeline />} />
                <Route path="crm/analytics" element={<CrmAnalytics />} />
                <Route path="crm/campaigns" element={<Campaigns />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />

              {/* Public routes — no auth required */}
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
