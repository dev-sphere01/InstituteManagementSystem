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
import DynamicFormView from "./pages/forms/DynamicFormView.jsx";

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
import CallingFormMaster from "./pages/masters/calling/CallingFormMaster.jsx";
import CallingManagement from "./pages/masters/calling/CallingManagement.jsx";
import ApplicationsList from "./pages/masters/applications/ApplicationsList.jsx";

// Student Pages
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import Admission from "./pages/admission/createAdmissions/Admission.jsx";
import Fee from "./pages/fee/Fee.jsx";

import StudentDetails from "./pages/student/AllStudents/StudentDetails.jsx";
import StudentProfile from "./pages/student/StudentProfile/StudentProfile.jsx";
import AddistionalFeatures from "./pages/masters/additionalFeatures/AdditionalFeatures.jsx";

// Calling pages
import BulkUpload from "./pages/calling/BulkUpload.jsx";
import EmployeeCalling from "./pages/calling/EmployeeCalling.jsx";
import ApplicationCallingQueue from "./pages/calling/ApplicationCallingQueue.jsx";
import LeadDetails from "./pages/calling/LeadDetails.jsx";
import LeadProfile from "./pages/calling/LeadProfile.jsx";
import TaskInbox from "./pages/workflow/TaskInbox.jsx";
import TaskDetails from "./pages/workflow/TaskDetails.jsx";
import WorkflowTemplates from "./pages/workflow/WorkflowTemplates.jsx";

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

                {/* Calling Routes */}
                <Route path="calling-management" element={<CallingManagement />} />
                <Route path="calling-form-master" element={<CallingFormMaster />} />
                <Route path="calling-management/bulk-upload" element={<BulkUpload />} />
                <Route path="applications" element={<ApplicationsList />} />
                <Route path="my-calls" element={<EmployeeCalling />} />
                <Route path="my-application-queue" element={<ApplicationCallingQueue />} />

                {/* Admission Routes */}
                <Route path="admission" element={<Admission />} />

                {/* Fee Routes */}
                <Route path="Fee" element={<Fee />} />
                {/* Workflow Routes */}
                <Route path="workflow/tasks" element={<TaskInbox />} />
                <Route path="workflow/tasks/:id" element={<TaskDetails />} />
                <Route path="workflow/templates" element={<WorkflowTemplates />} />

                {/* Change Password - now protected */}
                <Route path="change-password" element={<ChangePassword />} />

                {/* Student Details Table */}
                <Route path="student-details" element={<StudentDetails />} />

                {/* Exam Details and Student Performance */}
                <Route
                  path="student-details/:id"
                  element={<StudentProfile />}
                />
              </Route>

              {/* Calling detail routes (protected) */}
              <Route element={<RoleBasedRoutes />}>
                <Route path="/calling/lead/:leadId" element={<LeadDetails />} />
                <Route path="/calling/profile/:leadId" element={<LeadProfile />} />
              </Route>

              <Route path="/form/:encryptedData" element={<DynamicFormView />} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
