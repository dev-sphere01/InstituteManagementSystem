import React from "react";
// menu item icons imports
import { FaUserCheck, FaHandHoldingUsd } from "react-icons/fa";
import {
  Users,
  UserPlus,
  Upload,
  Database,
  Building,
  Laptop,
  Calculator,
  BarChart3,
  FileText,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  ClipboardList,
  FileSpreadsheet,
  CheckCircle,
  MapPin,
  User,
  History,
  CalendarPlus,
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  FileSearch,
  GraduationCap,
  BriefcaseBusiness,
  ReceiptIndianRupee,
  HandCoins,
  ScrollText,
  Calendar
} from "lucide-react";
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";


const allMenuItems = [
  // Employee Management Section
  { id: "employee-management", name: "Employee Management", type: "heading", permission: "employee_management.read" },
  { id: "all-employees", name: "All Employees", icon: <Users size={18} />, type: "item", permission: "employee_management.all_employees.read" },
  { id: "add-employee", name: "Add Employee", icon: <UserPlus size={18} />, type: "item", permission: "employee_management.add_employee.create" },
  { id: "import-employees", name: "Import Employees", icon: <Upload size={18} />, type: "item", permission: "employee_management.import_employees.read" },
  { id: "onboarding", name: "Onboarding", icon: <FaUserCheck />, type: "item", permission: "employee_management.onboarding.read" },
  { id: "employee-assessment", name: "Employee Assessment", icon: <HandCoins />, type: "item", permission: "employee_management.employee_assessment.read" },
  { id: "bulk-increments", name: "Bulk Increments", icon: <TrendingUp size={18} />, type: "item", permission: "employee_management.bulk_increments.read" },
  { id: "manage-increments", name: "Manage Increments", icon: <CheckCircle size={18} />, type: "item", permission: "payroll_management.ctc_assignment.read" },
  { id: "increment-letters", name: "Increment Letters", icon: <ScrollText size={18} />, type: "item", permission: "payroll_management.ctc_assignment.read" },

  // Payroll Management Section
  { id: "payroll-management", name: "Payroll Management", type: "heading", permission: "payroll_management.read" },
  { id: "import-attendance", name: "Import Attendance", icon: <Upload size={18} />, type: "item", permission: "payroll_management.import_attendance.create" },
  { id: "attendance-sync", name: "Attendance Sync (MDB)", icon: <Database size={18} />, type: "item", permission: "payroll_management.import_attendance.create" },
  { id: "alter-attendance", name: "Alter Attendance", icon: <Upload size={18} />, type: "item", permission: "payroll_management.alter_attendance.read" },
  { id: "other-allowances", name: "Other Allowances", icon: <DollarSign size={18} />, type: "item", permission: "payroll_management.other_allowances.read" },
  { id: "penalties", name: "Penalties", icon: <DollarSign size={18} />, type: "item", permission: "payroll_management.penalties.read" },
  { id: "process-payroll", name: "Process Payroll", icon: <Calculator size={18} />, type: "item", permission: "payroll_management.process_payroll.read" },
  { id: "payroll-reconciliation", name: "Payroll Reconciliation", icon: <FileSpreadsheet size={18} />, type: "item", permission: "payroll_management.process_payroll.read" },
  { id: "import-offline-payroll", name: "Import Offline Payroll", icon: <Upload size={18} />, type: "item", permission: "payroll_management.process_payroll.read" },
  { id: "ctc-assignment", name: "CTC Assignment", icon: <FaHandHoldingUsd size={18} />, type: "item", permission: "payroll_management.ctc_assignment.read" },

  { id: "reports", name: "Reports", icon: <TrendingUp size={18} />, type: "heading", permission: "reports_analytics.read" },
  { id: "reports", name: "Reports", icon: <TrendingUp size={18} />, type: "item", permission: "reports_analytics.read" },

  // Loan Management Section
  { id: "loan-management", name: "Loan Management", type: "heading", permission: "loan_management.read" },
  { id: "loans-advances", name: "Create Loan & Advance", icon: <DollarSign size={18} />, type: "item", permission: "loan_management.create_loans_advances.create" },
  // { id: "loans-advances-view", name: "All Loans & Advances", icon: <FaHandHoldingUsd />, type: "item", roleId: [1] },
  // { id: "loan-and-advance", name: "Loans & Advances", icon: <DollarSign size={18} />, type: "item", path: "/dashboard/loan-and-advance", permission: "my_loans_advances.read" },
  { id: "loan-reports", name: "Loan Reports", icon: <DollarSign size={18} />, type: "item", path: "/dashboard/loan-reports", permission: "loan_management.loan_reports.read"},


  // Leave Management

  { id: "leave-management", name: "Leave Management", type: "heading", permission: "leave_management.read" },
  { id: "leave-management/apply", name: "Apply Leave", icon: <CalendarPlus size={18} />, type: "item", path: "/dashboard/leave-management", permission: "leave_management.apply_leave.create" },
  { id: "leave-management/history", name: "Leave History", icon: <History size={18} />, type: "item", path: "/dashboard/leave-history", permission: "leave_management.leave_history.read" },
  { id: "leave-management/calender", name: "Leave Calendar", icon: <Calendar size={18} />, type: "item", path: "/dashboard/leave-calender", permission: "leave_calendar.read"},
  { id: "leave-management/leave-reports", name: "Leave Reports", icon: <Calendar size={18} />, type: "item", path: "/dashboard/leave-reports", permission: "leave_management.leave_reports.read" },
  { id: "leave-management/holiday-entry", name: "Holiday Entry", icon: <Calendar size={18} />, type: "item", path: "/dashboard/holiday-entry", permission: "leave_management.holiday_entry.read" },


  // Administration Section
  // { id: "administration", name: "Administration", type: "heading", permission: "administration.read" },
  // { id: "user-roles", name: "User Roles", icon: <Shield size={18} />, type: "item", permission: "administration.user_roles.read" },  
  // { id: "settings", name: "System Settings", icon: <Settings size={18} />, type: "item", permission: "administration.system_settings.read" },
  // { id: "audit-logs", name: "Audit Logs", icon: <ClipboardList size={18} />, type: "item", permission: "administration.audit_logs.read" },

  // Masters Section
  { id: "masters", name: "Masters", type: "heading", permission: "masters.read" },
  { id: "departments", name: "Departments", icon: <Building size={18} />, type: "item", permission: "masters.departments.read" },
  { id: "positions", name: "Positions", icon: <MapPin size={18} />, type: "item", permission: "masters.positions.read" },
  { id: "attendance-settings", name: "Attendance-Settings", icon: <Settings size={18} />, type: "item", permission: "masters.attendance_settings.read" },
  { id: "ems-settings", name: "EMS Settings", icon: <Settings size={18} />, type: "item", permission: "administration.system_settings.read" },
  // { id: "salary-structures", name: "Salary Structures", icon: <BarChart3 size={18} />, type: "item", permission: "payroll_management.salary_structures.read" },
  { id: "payroll-slabs", name: "Payroll Slabs", icon: <ReceiptIndianRupee size={18} />, type: "item", permission: "masters.payroll_slabs.read" },
  { id: "assets", name: "Assets", icon: <Laptop size={18} />, type: "item", permission: "masters.assets.read" },

  // Attendance Pages
  { id: "attendance", name: "Attendance", type: "heading", permission: "attendance_management.read" },
  { id: "attendance", name: "Monthly Attendance", icon: <CalendarDays size={18} />, type: "item", path: "/dashboard/attendance", permission: "attendance_management.monthly_attendance.read" },

  // Salary Pages
  { id: "salary", name: "Salary & Payslips", type: "heading", permission: "employee_self_service.salary_payslips.read" },
  { id: "salary-and-payslips", name: "Download Payslips", icon: <FileText size={18} />, type: "item", path: "/dashboard/salary-and-payslips", permission: "employee_self_service.salary_payslips.read" },

  // Bank Pages
  { id: "bank-details", name: "Bank Details", type: "heading", permission: "employee_self_service.bank_details.read" },
  { id: "bank-details", name: "View / Update Bank Info", icon: <CreditCard size={18} />, type: "item", path: "/dashboard/bank-details", permission: "employee_self_service.bank_details.read" },

  // Document Pages
  { id: "documents", name: "Documents", type: "heading", permission: "employee_self_service.documents.read" },
  { id: "documents", name: "My Documents", icon: <FileSearch size={18} />, type: "item", path: "/dashboard/documents", permission: "employee_self_service.documents.read" },

  // Education Pages
  { id: "acad-and-prof", name: "Academic and Professional", type: "heading", permission: "employee_self_service.academic_info.read" },
  { id: "academic", name: "Academic", icon: <GraduationCap size={18} />, type: "item", path: "/dashboard/academic", permission: "employee_self_service.academic_info.read" },
  { id: "professional", name: "Professional", icon: <BriefcaseBusiness size={18} />, type: "item", path: "/dashboard/professional", permission: "employee_self_service.professional_info.read" },

  // Employee Self Service
  // { id: "profile-management", name: "Profile Management", type: "heading", permission: "employee_self_service.read" },
  // { id: "profile", name: "My Profile", icon: <User size={18} />, type: "item", path: "/dashboard/profile", permission: "employee_self_service.read.profile_management.read" },
];

// 🔑 Function to filter menus by permissions
export const getMenuConfig = () => {
  return allMenuItems.filter((item) => {
    // If no permission is required, show the item (for headings without permissions)
    if (!item.permission) {
      return true;
    }

    // Check if user has the required permission
    return hasPermission(item.permission);
  });
};

// Helper function to check if a section has any visible items
export const hasVisibleItems = (sectionId) => {
  const visibleItems = getMenuConfig();
  return visibleItems.some(item =>
    item.type === "item" &&
    item.id.startsWith(sectionId)
  );
};

