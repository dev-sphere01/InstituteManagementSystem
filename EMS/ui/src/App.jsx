import React from 'react';

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import OuterLayout from '@/layouts/OuterLayout';
import InnerLayout from '@/layouts/InnerLayout';
import Login from '@/pages/auth/Login';
// import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Welcome from '@/pages/auth/Welcome/Welcome';
import ProtectedRoutes, { PermissionRoute } from '@/routes/ProtectedRoutes';
import GuestRoutes from '@/routes/GuestRoutes';
import useAuthStore from '@/store/authStore';

import AddEmployee from '@/pages/EmployeeManagement/AddEmployee/AddEmployee';
import ImportEmployees from '@/pages/EmployeeManagement/ImportEmployee/ImportEmployees';
import AllEmployees from '@/pages/EmployeeManagement/AllEmployees/AllEmployees';
import EmployeeDetails from '@/pages/EmployeeManagement/AllEmployees/components/EmployeeDetails';
import Onboarding from '@/pages/EmployeeManagement/OnBoarding/OnBoarding';

// Master Routes
import Departments from '@/pages/Masters/Departments/Departments';
import Positions from '@/pages/Masters/Positions/Positions';
import SalaryStructures from '@/pages/Payroll/SalaryStructures/SalaryStructures';
import PayrollSlabs from '@/pages/Masters/PayrollSlabs/PayrollSlabs';
import AttendanceSettings from '@/pages/Masters/AttendanceSettings/AttendanceSettings';
import Assets from '@/pages/EmployeeManagement/Assets/Assets';

import ImportAttendance from '@/pages/Payroll/ImportAttendance';
import AttendanceSync from '@/pages/Payroll/AttendanceSync';
import LoansAdvances from '@/pages/Payroll/Loans&Advances/CreateNew/LoansAdvances';
import LoanAdminDashboard from '@/pages/Payroll/Loans&Advances/ViewActive/ViewActive';
import Reports from '@/pages/Payroll/Reports';

import UserRoles from '@/pages/Administration/UserRoles';
import Settings from '@/pages/Administration/Settings';
import AuditLogs from '@/pages/Administration/AuditLogs';

import Dashboard from '@/pages/dashboard/Dashboard';

// User pages
import ProfilePage from '@/pages/Profile/ProfilePage';
import UserSettings from '@/pages/Profile/components/Settings';
import ChangePassword from '@/pages/Profile/components/ChangePassword';

// Not found page
import NotFound from '@/pages/NotFound/NotFound';

// Notification wrapper (mounts toast globally)
import NotificationContainer from '@/components/NotificationContainer';

// Confirmation wrapper (mounts toast globally)
import ConfirmationProvider from '@/components/ConfirmationProvider';

// Demo pages
import ExcelUploadDemo from '@/demopages/ExcelUploadDemo';

import './App.css';
import UpdateEmployee from '@/pages/EmployeeManagement/UpdateEmployee/UpdateEmployee';
import EmployeeLayout from '@/layouts/EmployeeLayout';

//Employee Pages
import Home from '@/pages/EmployeePages/Home/Home';
import Attendance from '@/pages/EmployeePages/Attendance/Attendance';
import BankDetails from '@/pages/EmployeePages/BankDetails/BankDetails';
import Documents from '@/pages/EmployeePages/Documents/Documents';
import LeaveManagement from '@/pages/EmployeePages/LeaveManagement/LeaveManagement';
import LoansAndAdvances from '@/pages/EmployeePages/LoansAndAdvances/LoansAndAdvances';
import Profile from '@/pages/EmployeePages/Profile/Profile';
import SalaryAndPayslips from '@/pages/EmployeePages/SalaryAndPaylips/SalaryAndPayslips';
import LeaveHistory from '@/pages/EmployeePages/LeaveManagement/components/LeaveHistory';
import EmpDataMapDemo from '@/demopages/EmpDataMapDemo';
import PayrollAssignment from '@/pages/Payroll/PayrollAssignment';
import CTCAssignment from '@/pages/Payroll/CTCAssignment';
import Academic from '@/pages/EmployeePages/AcadAndProf/Academic';
import Professional from '@/pages/EmployeePages/AcadAndProf/Professional';
import ProcessPayroll from './pages/Payroll/ProcessPayroll';
import PayrollReconciliation from './pages/Payroll/PayrollReconciliation';
import ImportOfflinePayroll from './pages/Payroll/ImportOfflinePayroll';
import AlterAttendance from './pages/Payroll/AlterAttendance';
import OtherAllowances from './pages/Payroll/OtherAllowances';
import Penalty from './pages/Payroll/Penalty';
import BulkIncrementUpload from './pages/Payroll/BulkIncrementUpload';
import ManageIncrements from './pages/Payroll/ManageIncrements';
import IncrementLetters from './pages/Payroll/IncrementLetters';
import EMSSettings from './pages/Administration/EMSSettings';
import EmployeePerformance from './pages/EmployeeManagement/PerformanceManagement/EmployeePerformance';
import LeaveCalender from './pages/EmployeePages/LeaveManagement/LeaveCalender';
import LoanReports from '@/pages/Payroll/Loans&Advances/Reports/LoanReports';
import LeaveReports from '@/pages/EmployeePages/LeaveManagement/LeaveReports';
import Holidays from '@/pages/EmployeePages/LeaveManagement/Holidays';


function App() {
  const { initializeAuth, getUserRole, isLoading, isInitialized } = useAuthStore();

  // Initialize auth state on app load
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const roleId = getUserRole(); // Get role from auth store

  // Show loading spinner while initializing auth
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* ✅ Mount notifications globally — outside Routes */}
      <NotificationContainer />
      {/* ✅ Mount confirmation modal globally — outside Routes */}
      <ConfirmationProvider />

      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route
          element={
            <GuestRoutes>
              <OuterLayout />
            </GuestRoutes>
          }
        >
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Welcome Route - for password change */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoutes>
              <Welcome />
            </ProtectedRoutes>
          }
        />


        {/*-------------------------- Protected Routes --------------------------*/}
        <Route
          element={
            <ProtectedRoutes>
              <InnerLayout />
            </ProtectedRoutes>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PermissionRoute required="dashboard.read">
              <Dashboard />
            </PermissionRoute>
          } />

          {/*-------------------------- Employee Management --------------------------*/}
          <Route path="/dashboard/all-employees" element={
            <PermissionRoute required="employee_management.all_employees.read">
              <AllEmployees />
            </PermissionRoute>
          } />
          <Route path="/dashboard/add-employee" element={
            <PermissionRoute required="employee_management.add_employee.create">
              <AddEmployee />
            </PermissionRoute>
          } />
          <Route path="/dashboard/import-employees" element={
            <PermissionRoute required="employee_management.import_employees.read">
              <ImportEmployees />
            </PermissionRoute>
          } />
          <Route path="/dashboard/all-employees/:id" element={
            <PermissionRoute required="employee_management.all_employees.read">
              <EmployeeDetails />
            </PermissionRoute>
          } />
          <Route path="/dashboard/onboarding" element={
            <PermissionRoute required="employee_management.onboarding.read">
              <Onboarding />
            </PermissionRoute>
          } />
          <Route path="/dashboard/employee-assessment" element={
            <PermissionRoute required="employee_management.employee_assessment.read">
              <EmployeePerformance />
            </PermissionRoute>
          } />
          <Route path="/dashboard/onboarding/update-employee/:id" element={
            <PermissionRoute required="employee_management.update_employee.update">
              <UpdateEmployee />
            </PermissionRoute>
          } />
          <Route path="/dashboard/assets" element={
            <PermissionRoute required="employee_management.assets.read">
              <Assets />
            </PermissionRoute>
          } />

          {/*-------------------------- Payroll Management --------------------------*/}
          <Route path="/dashboard/import-attendance" element={
            <PermissionRoute required="payroll_management.import_attendance.create">
              <ImportAttendance />
            </PermissionRoute>
          } />
          <Route path="/dashboard/attendance-sync" element={
            <PermissionRoute required="payroll_management.import_attendance.create">
              <AttendanceSync />
            </PermissionRoute>
          } />
          <Route path="/dashboard/salary-structures" element={
            <PermissionRoute required="payroll_management.salary_structures.read">
              <SalaryStructures />
            </PermissionRoute>
          } />
          <Route path="/dashboard/payroll-assignment" element={
            <PermissionRoute required="payroll_management.payroll_assignment.read">
              <PayrollAssignment />
            </PermissionRoute>
          } />
          <Route path="/dashboard/process-payroll" element={
            <PermissionRoute required="payroll_management.process_payroll.read">
              <ProcessPayroll />
            </PermissionRoute>
          } />
          <Route path="/dashboard/ctc-assignment" element={
            <PermissionRoute required="payroll_management.ctc_assignment.read">
              <CTCAssignment />
            </PermissionRoute>
          } />
          <Route path="/dashboard/alter-attendance" element={
            <PermissionRoute required="payroll_management.alter_attendance.read">
              <AlterAttendance />
            </PermissionRoute>
          } />
          <Route path="/dashboard/other-allowances" element={
            <PermissionRoute required="payroll_management.other_allowances.read">
              <OtherAllowances />
            </PermissionRoute>
          } />
          <Route path="/dashboard/penalties" element={
            <PermissionRoute required="payroll_management.penalties.read">
              <Penalty />
            </PermissionRoute>
          } />
          <Route path="/dashboard/bulk-increments" element={
            <PermissionRoute required="payroll_management.ctc_assignment.read">
              <BulkIncrementUpload />
            </PermissionRoute>
          } />
          <Route path="/dashboard/manage-increments" element={
            <PermissionRoute required="payroll_management.ctc_assignment.read">
              <ManageIncrements />
            </PermissionRoute>
          } />
          <Route path="/dashboard/increment-letters" element={
            <PermissionRoute required="payroll_management.ctc_assignment.read">
              <IncrementLetters />
            </PermissionRoute>
          } />
          <Route path="/dashboard/payroll-reconciliation" element={
            <PermissionRoute required="payroll_management.process_payroll.read">
              <PayrollReconciliation />
            </PermissionRoute>
          } />
          <Route path="/dashboard/import-offline-payroll" element={
            <PermissionRoute required="payroll_management.process_payroll.read">
              <ImportOfflinePayroll />
            </PermissionRoute>
          } />
          <Route path="/dashboard/ems-settings" element={
            <PermissionRoute required="administration.system_settings.read">
              <EMSSettings />
            </PermissionRoute>
          } />

          {/*-------------------------- Reports --------------------------*/}
          <Route path="/dashboard/reports" element={
            <PermissionRoute required="reports_analytics.read">
              <Reports />
            </PermissionRoute>
          } />
          <Route path="/dashboard/loan-reports" element={
            <PermissionRoute required="loan_management.loan_reports.read">
              <LoanReports />
            </PermissionRoute>
          } />

          <Route path="/dashboard/leave-management/leave-reports" element={
            <PermissionRoute required="leave_management.leave_reports.read">
              <LeaveReports />
            </PermissionRoute>
          } />


          {/*-------------------------- Loan Management --------------------------*/}
          <Route path="/dashboard/loans-advances" element={
            <PermissionRoute required="loan_management.create_loans_advances.create">
              <LoansAdvances />
            </PermissionRoute>
          } />
          <Route path="/dashboard/loans-advances-view" element={
            <PermissionRoute required="view_active_loans.read">
              <LoanAdminDashboard />
            </PermissionRoute>
          } />


          {/*-------------------------- Leave Management --------------------------*/}
          <Route path="/dashboard/leave-management/apply" element={
            <PermissionRoute required="leave_management.apply_leave.create">
              <LeaveManagement />
            </PermissionRoute>
          } />
          <Route path="/dashboard/leave-management/calender" element={
            <PermissionRoute required="leave_management.leave_calendar.read">
              <LeaveCalender />
            </PermissionRoute>
          } />
          <Route path="/dashboard/leave-management/history" element={
            <PermissionRoute required="leave_management.leave_history.read">
              <LeaveHistory />
            </PermissionRoute>
          } />
          <Route path="/dashboard/leave-management/holiday-entry" element={
            <PermissionRoute required="leave_management.holiday_entry.read">
              <Holidays />
            </PermissionRoute>
          } />

          {/*-------------------------- Administration --------------------------*/}
          <Route path="/dashboard/user-roles" element={
            <PermissionRoute required="administration.user_roles.read">
              <UserRoles />
            </PermissionRoute>
          } />
          <Route path="/dashboard/settings" element={
            <PermissionRoute required="administration.system_settings.read">
              <Settings />
            </PermissionRoute>
          } />
          <Route path="/dashboard/audit-logs" element={
            <PermissionRoute required="administration.audit_logs.read">
              <AuditLogs />
            </PermissionRoute>
          } />


          {/*-------------------------- Masters --------------------------*/}
          <Route path="/dashboard/departments/*" element={
            <PermissionRoute required="masters.departments.read">
              <Departments />
            </PermissionRoute>
          } />
          <Route path="/dashboard/positions/*" element={
            <PermissionRoute required="masters.positions.read">
              <Positions />
            </PermissionRoute>
          } />
          <Route path="/dashboard/payroll-slabs" element={
            <PermissionRoute required="masters.payroll_slabs.read">
              <PayrollSlabs />
            </PermissionRoute>
          } />
          <Route path="/dashboard/attendance-settings" element={
            <PermissionRoute required="masters.attendance_settings.read">
              <AttendanceSettings />
            </PermissionRoute>
          } />
          {/* <Route path="/dashboard/rbac" element={
            <PermissionRoute required="rbac.read">
              <RBAC />
            </PermissionRoute>
          } /> */}


          {/*-------------------------- Employee Self Service --------------------------*/}
          <Route path="/dashboard/attendance" element={
            <PermissionRoute required="attendance_management.monthly_attendance.read">
              <Attendance />
            </PermissionRoute>
          } />
          <Route path="/dashboard/bank-details" element={
            <PermissionRoute required="employee_self_service.bank_details.read">
              <BankDetails />
            </PermissionRoute>
          } />
          <Route path="/dashboard/documents" element={
            <PermissionRoute required="employee_self_service.documents.read">
              <Documents />
            </PermissionRoute>
          } />
          <Route path="/dashboard/profile" element={
            <PermissionRoute required="employee_self_service.profile_management.read">
              <Profile />
            </PermissionRoute>
          } />
          <Route path="/dashboard/salary-and-payslips" element={
            <PermissionRoute required="employee_self_service.salary_payslips.read">
              <SalaryAndPayslips />
            </PermissionRoute>
          } />
          <Route path="/dashboard/loan-and-advance" element={
            <PermissionRoute required="employee_self_service.my_loans_advances.read">
              <LoansAndAdvances />
            </PermissionRoute>
          } />
          <Route path="/dashboard/academic" element={
            <PermissionRoute required="employee_self_service.academic_info.read">
              <Academic />
            </PermissionRoute>
          } />
          <Route path="/dashboard/professional" element={
            <PermissionRoute required="employee_self_service.professional_info.read">
              <Professional />
            </PermissionRoute>
          } />

          {/*-------------------------- Demo pages - no permissions required --------------------------*/}
          <Route path="/dashboard/excel-upload" element={<ExcelUploadDemo />} />
          <Route path='/dashboard/emp-data-map' element={<EmpDataMapDemo />} />

          {/* Profile routes - no permissions required for user's own profile */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;