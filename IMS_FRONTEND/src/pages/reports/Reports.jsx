import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Users, Target, DollarSign, Award, Trophy,
  Zap, Calendar, Plus, RefreshCw, Send, CheckCircle, AlertCircle, Sparkles, ChevronRight,
  Download, Search, Filter, Clock, ClipboardList, MapPin, Activity, Briefcase, FileText, ChevronUp, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useThemeStore } from '../../store';

// ==========================================
// 1. SLEEK SANDBOX DATA DESIGN FOR ALL 7 REPORTS
// ==========================================

// Report 1: Daily Leads + Conversions (MongoDB lead/enquiry schemas)
const initialDailyLeads = [
  { date: '2026-05-10', leads: 48, conversions: 12, hot: 15, warm: 20, cold: 13, revenue: 96000 },
  { date: '2026-05-11', leads: 52, conversions: 15, hot: 18, warm: 22, cold: 12, revenue: 120000 },
  { date: '2026-05-12', leads: 45, conversions: 10, hot: 12, warm: 20, cold: 13, revenue: 80000 },
  { date: '2026-05-13', leads: 60, conversions: 18, hot: 22, warm: 25, cold: 13, revenue: 144000 },
  { date: '2026-05-14', leads: 55, conversions: 14, hot: 17, warm: 23, cold: 15, revenue: 112000 },
  { date: '2026-05-15', leads: 70, conversions: 22, hot: 25, warm: 30, cold: 15, revenue: 176000 },
  { date: '2026-05-16', leads: 65, conversions: 19, hot: 20, warm: 28, cold: 17, revenue: 152000 },
  { date: '2026-05-17', leads: 38, conversions: 8, hot: 10, warm: 18, cold: 10, revenue: 64000 },
  { date: '2026-05-18', leads: 42, conversions: 9, hot: 11, warm: 20, cold: 11, revenue: 72000 },
  { date: '2026-05-19', leads: 58, conversions: 16, hot: 19, warm: 24, cold: 15, revenue: 128000 },
  { date: '2026-05-20', leads: 64, conversions: 21, hot: 23, warm: 26, cold: 15, revenue: 168000 },
  { date: '2026-05-21', leads: 72, conversions: 25, hot: 28, warm: 29, cold: 15, revenue: 200000 },
  { date: '2026-05-22', leads: 80, conversions: 28, hot: 32, warm: 33, cold: 15, revenue: 224000 }
];

// Report 2: Branch-wise Admission Summary (MongoDB branch/admission schemas)
const initialBranchAdmissions = [
  { branch: 'Lucknow Main', admissions: 145, target: 150, revenue: 1160000, dues: 180000, ccc: 40, tally: 35, python: 30, webdev: 25, olevel: 15 },
  { branch: 'Hazratganj Centre', admissions: 120, target: 130, revenue: 960000, dues: 140000, ccc: 30, tally: 28, python: 25, webdev: 22, olevel: 15 },
  { branch: 'Aliganj Hub', admissions: 95, target: 100, revenue: 760000, dues: 110000, ccc: 25, tally: 22, python: 20, webdev: 18, olevel: 10 },
  { branch: 'Indira Nagar', admissions: 85, target: 90, revenue: 680000, dues: 95000, ccc: 22, tally: 20, python: 18, webdev: 15, olevel: 10 },
  { branch: 'Noida Extension', admissions: 110, target: 120, revenue: 880000, dues: 125000, ccc: 28, tally: 25, python: 24, webdev: 20, olevel: 13 }
];

// Report 3: Pending Office Tasks + Overdue List (Office Workflow module)
const initialOfficeTasks = [
  { id: 'OT-101', title: 'Collect Marksheet & Photos', description: 'Pending student enrollment documents verification.', deadline: '2026-05-18', assignedTo: 'Preeti Rawat', status: 'Overdue', priority: 'High', branch: 'Lucknow Main', category: 'Documentation' },
  { id: 'OT-102', title: 'Verify Fee Cheque Clearance', description: 'Validate Cheque #82910 received from Rohit.', deadline: '2026-05-20', assignedTo: 'Ramesh Chandra', status: 'Overdue', priority: 'High', branch: 'Hazratganj Centre', category: 'Finance' },
  { id: 'OT-103', title: 'Generate CCC Certificates', description: 'Process final certificates for batch CCC-May.', deadline: '2026-05-23', assignedTo: 'Amit Bajpai', status: 'Pending', priority: 'Medium', branch: 'Aliganj Hub', category: 'Academics' },
  { id: 'OT-104', title: 'Course Registration Validation', description: 'Approve student portals for fresh registrations.', deadline: '2026-05-24', assignedTo: 'Neha Saxena', status: 'Pending', priority: 'Low', branch: 'Indira Nagar', category: 'Admissions' },
  { id: 'OT-105', title: 'Upload Exam Marks to Portal', description: 'Enter Python test results on central EMS database.', deadline: '2026-05-21', assignedTo: 'Shailendra Shukla', status: 'Overdue', priority: 'High', branch: 'Lucknow Main', category: 'Exams' },
  { id: 'OT-106', title: 'Prepare Batch Appraisal Report', description: 'Document performance indices for review meeting.', deadline: '2026-05-25', assignedTo: 'Preeti Rawat', status: 'Pending', priority: 'Medium', branch: 'Noida Extension', category: 'Management' }
];

// Report 4: Fee Collection + Dues (MongoDB fee & admission schemas)
const initialFeesDues = [
  { invoiceNo: 'INV-2026-001', student: 'Aarav Mehta', course: 'O Level', amountPaid: 15000, amountDue: 5000, totalAmount: 20000, paymentMode: 'Online', status: 'Partial', date: '2026-05-12', branch: 'Lucknow Main' },
  { invoiceNo: 'INV-2026-002', student: 'Ananya Roy', course: 'Python Web Dev', amountPaid: 25000, amountDue: 0, totalAmount: 25000, paymentMode: 'UPI', status: 'Paid', date: '2026-05-14', branch: 'Hazratganj Centre' },
  { invoiceNo: 'INV-2026-003', student: 'Rahul Sharma', course: 'Tally Prime', amountPaid: 8000, amountDue: 4000, totalAmount: 12000, paymentMode: 'Cash', status: 'Partial', date: '2026-05-15', branch: 'Aliganj Hub' },
  { invoiceNo: 'INV-2026-004', student: 'Ishita Dwivedi', course: 'CCC', amountPaid: 0, amountDue: 5000, totalAmount: 5000, paymentMode: 'Cheque', status: 'Overdue', date: '2026-05-10', branch: 'Lucknow Main' },
  { invoiceNo: 'INV-2026-005', student: 'Kabir Verma', course: 'Data Science', amountPaid: 45000, amountDue: 15000, totalAmount: 60000, paymentMode: 'Online', status: 'Partial', date: '2026-05-18', branch: 'Noida Extension' },
  { invoiceNo: 'INV-2026-006', student: 'Riya Gupta', course: 'Graphic Design', amountPaid: 18000, amountDue: 0, totalAmount: 18000, paymentMode: 'UPI', status: 'Paid', date: '2026-05-20', branch: 'Indira Nagar' }
];

// Report 5: Employee Attendance + Late Ranking (C# MySQL database)
const initialAttendanceLate = [
  { empId: 'EMP-011', name: 'Vikram Aditya', department: 'Counselling', onTimeDays: 20, lateDays: 6, workingDays: 26, lateRank: 1, avgCheckIn: '09:42 AM', branch: 'Lucknow Main' },
  { empId: 'EMP-014', name: 'Siddharth Sen', department: 'Marketing', onTimeDays: 21, lateDays: 5, workingDays: 26, lateRank: 2, avgCheckIn: '09:38 AM', branch: 'Hazratganj Centre' },
  { empId: 'EMP-022', name: 'Shweta Mishra', department: 'Academics', onTimeDays: 23, lateDays: 3, workingDays: 26, lateRank: 3, avgCheckIn: '09:35 AM', branch: 'Aliganj Hub' },
  { empId: 'EMP-017', name: 'Alok Ranjan', department: 'Admissions', onTimeDays: 24, lateDays: 2, workingDays: 26, lateRank: 4, avgCheckIn: '09:31 AM', branch: 'Indira Nagar' },
  { empId: 'EMP-031', name: 'Kirti Azad', department: 'Finance', onTimeDays: 25, lateDays: 1, workingDays: 26, lateRank: 5, avgCheckIn: '09:27 AM', branch: 'Noida Extension' },
  { empId: 'EMP-005', name: 'Meenakshi Iyer', department: 'Counselling', onTimeDays: 26, lateDays: 0, workingDays: 26, lateRank: 6, avgCheckIn: '09:18 AM', branch: 'Lucknow Main' }
];

// Report 6: Employee Performance Leaderboard (C# MySQL appraisal score context)
const initialAppraisalScores = [
  { empId: 'EMP-005', employeeName: 'Meenakshi Iyer', department: 'Counselling', selfDevelopment: 90, decisionMaking: 92, productivityEfficiency: 95, finalScore: 94, rating: 'Outstanding', comments: 'Excellent leads conversion management, proactive attitude.', reviewedBy: 'Dr. R. K. Pathak', month: 5, year: 2026, branch: 'Lucknow Main' },
  { empId: 'EMP-031', employeeName: 'Kirti Azad', department: 'Finance', selfDevelopment: 88, decisionMaking: 89, productivityEfficiency: 92, finalScore: 90, rating: 'Outstanding', comments: 'Meticulous audits and accounts closing operations.', reviewedBy: 'Dr. R. K. Pathak', month: 5, year: 2026, branch: 'Noida Extension' },
  { empId: 'EMP-022', employeeName: 'Shweta Mishra', department: 'Academics', selfDevelopment: 85, decisionMaking: 86, productivityEfficiency: 88, finalScore: 87, rating: 'Very Good', comments: 'High satisfaction index in Python & Web Dev lectures.', reviewedBy: 'Sanjay Kapoor', month: 5, year: 2026, branch: 'Aliganj Hub' },
  { empId: 'EMP-017', employeeName: 'Alok Ranjan', department: 'Admissions', selfDevelopment: 80, decisionMaking: 85, productivityEfficiency: 84, finalScore: 83, rating: 'Very Good', comments: 'Prompt onboarding support and document validation.', reviewedBy: 'Sanjay Kapoor', month: 5, year: 2026, branch: 'Indira Nagar' },
  { empId: 'EMP-011', employeeName: 'Vikram Aditya', department: 'Counselling', selfDevelopment: 78, decisionMaking: 80, productivityEfficiency: 75, finalScore: 77, rating: 'Good', comments: 'Solid hustle, needs attention to morning late marks.', reviewedBy: 'Meenakshi Iyer', month: 5, year: 2026, branch: 'Lucknow Main' }
];

// Report 7: Marketing Campaign ROI (MongoDB campaign tracking)
const initialCampaignROI = [
  { campaignName: 'Meta Summer Admissions 2026', channel: 'Meta', budget: 150000, leads: 450, conversions: 112, revenue: 672000, isActive: 'Active' },
  { campaignName: 'Google High-Intent Search', channel: 'Google', budget: 180000, leads: 320, conversions: 88, revenue: 580000, isActive: 'Active' },
  { campaignName: 'Lucknow Walk-in Seminar', channel: 'Offline', budget: 80000, leads: 150, conversions: 42, revenue: 294000, isActive: 'Active' },
  { campaignName: 'Student Referral Network', channel: 'Referral', budget: 20000, leads: 180, conversions: 38, revenue: 210000, isActive: 'Active' },
  { campaignName: 'Meta Retargeting Campaign', channel: 'Meta', budget: 50000, leads: 120, conversions: 14, revenue: 70000, isActive: 'Inactive' },
  { campaignName: 'Local Print Media Ads', channel: 'Offline', budget: 40000, leads: 25, conversions: 2, revenue: 24000, isActive: 'Inactive' }
];

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// List of Report definitions
const reportsDef = [
  { id: 'leads', title: 'Daily Leads & Conversions', dbSource: 'MongoDB (Lead Schema)', icon: TrendingUp, desc: 'Tracks daily incoming inquiries, follow-ups, converted leads, and overall conversion pipeline status.' },
  { id: 'branches', title: 'Branch Admissions Summary', dbSource: 'MongoDB (Admissions & Branch Schemas)', icon: MapPin, desc: 'Provides active student enrollment levels, revenue statistics, targets, and course enrollment breakdowns by branch.' },
  { id: 'tasks', title: 'Office Tasks & Overdue List', dbSource: 'MongoDB (Office Operations Hub)', icon: ClipboardList, desc: 'Monitors back-office assignments, certificate generations, audits, and tracks overdue activities by employee.' },
  { id: 'fees', title: 'Fee Collection & Dues', dbSource: 'MongoDB (Fee & Billing Schemas)', icon: DollarSign, desc: 'Calculates total fee components collected, active student dues, partial invoice payments, and logs recent transactions.' },
  { id: 'attendance', title: 'Employee Attendance & Lateness', dbSource: 'MySQL (EMS Attendance Hub)', icon: Clock, desc: 'Displays overall working statistics, late rank indexes, averages check-in hours, and logs discipline scores.' },
  { id: 'performance', title: 'Performance Leaderboard', dbSource: 'MySQL (EMS Appraisals Database)', icon: Trophy, desc: 'Analyzes staff scoring indexes, self-development metrics, decision scores, and overall executive appraisal rankings.' },
  { id: 'roi', title: 'Marketing Campaign ROI', dbSource: 'MongoDB (Campaign Schemas)', icon: Target, desc: 'Compares active media campaigns, budget inputs, total conversions, cost-per-lead (CPL), and calculates net return percentage.' }
];

export default function Reports() {
  const { isDarkMode } = useThemeStore();

  // Tab State
  const [activeReportTab, setActiveReportTab] = useState('leads');

  // Datasets State
  const [dailyLeads, setDailyLeads] = useState(initialDailyLeads);
  const [branchAdmissions, setBranchAdmissions] = useState(initialBranchAdmissions);
  const [officeTasks, setOfficeTasks] = useState(initialOfficeTasks);
  const [feesDues, setFeesDues] = useState(initialFeesDues);
  const [attendanceLate, setAttendanceLate] = useState(initialAttendanceLate);
  const [appraisalScores, setAppraisalScores] = useState(initialAppraisalScores);
  const [campaignROI, setCampaignROI] = useState(initialCampaignROI);

  // Filters State
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Sorting Table
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Simulation State
  const [showSimModal, setShowSimModal] = useState(false);
  const [simReportType, setSimReportType] = useState('leads');

  // Sim inputs
  const [simLeadDate, setSimLeadDate] = useState('2026-05-23');
  const [simLeadCount, setSimLeadCount] = useState('50');
  const [simLeadConversions, setSimLeadConversions] = useState('15');
  const [simLeadRevenue, setSimLeadRevenue] = useState('120000');

  const [simBranchName, setSimBranchName] = useState('Lucknow Main');
  const [simBranchAdmissions, setSimBranchAdmissions] = useState('25');
  const [simBranchRevenue, setSimBranchRevenue] = useState('200000');

  const [simTaskTitle, setSimTaskTitle] = useState('');
  const [simTaskAssigned, setSimTaskAssigned] = useState('Preeti Rawat');
  const [simTaskBranch, setSimTaskBranch] = useState('Lucknow Main');
  const [simTaskPriority, setSimTaskPriority] = useState('Medium');
  const [simTaskStatus, setSimTaskStatus] = useState('Pending');

  const [simFeeStudent, setSimFeeStudent] = useState('');
  const [simFeePaid, setSimFeePaid] = useState('10000');
  const [simFeeDue, setSimFeeDue] = useState('5000');
  const [simFeeCourse, setSimFeeCourse] = useState('CCC');

  const [simEmpId, setSimEmpId] = useState('');
  const [simEmpName, setSimEmpName] = useState('');
  const [simEmpLateDays, setSimEmpLateDays] = useState('3');
  const [simEmpCheckIn, setSimEmpCheckIn] = useState('09:32 AM');

  const [simAppScore, setSimAppScore] = useState('90');
  const [simAppRating, setSimAppRating] = useState('Outstanding');
  const [simAppComments, setSimAppComments] = useState('');

  const [simCampName, setSimCampName] = useState('');
  const [simCampChannel, setSimCampChannel] = useState('Meta');
  const [simCampBudget, setSimCampBudget] = useState('100000');
  const [simCampConversions, setSimCampConversions] = useState('20');
  const [simCampLeads, setSimCampLeads] = useState('150');
  const [simCampRevenue, setSimCampRevenue] = useState('150000');

  // Triggering simulations
  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    if (simReportType === 'leads') {
      const newLead = {
        date: simLeadDate,
        leads: Number(simLeadCount) || 0,
        conversions: Number(simLeadConversions) || 0,
        hot: Math.round((Number(simLeadCount) || 0) * 0.4),
        warm: Math.round((Number(simLeadCount) || 0) * 0.4),
        cold: Math.round((Number(simLeadCount) || 0) * 0.2),
        revenue: Number(simLeadRevenue) || 0
      };
      setDailyLeads(prev => [newLead, ...prev]);
    } else if (simReportType === 'branches') {
      setBranchAdmissions(prev => prev.map(b => {
        if (b.branch === simBranchName) {
          return {
            ...b,
            admissions: b.admissions + (Number(simBranchAdmissions) || 0),
            revenue: b.revenue + (Number(simBranchRevenue) || 0)
          };
        }
        return b;
      }));
    } else if (simReportType === 'tasks') {
      if (!simTaskTitle.trim()) return;
      const newTask = {
        id: 'OT-' + (100 + officeTasks.length + 1),
        title: simTaskTitle,
        description: 'Simulated task added via Sandbox panel.',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        assignedTo: simTaskAssigned,
        status: simTaskStatus,
        priority: simTaskPriority,
        branch: simTaskBranch,
        category: 'Office Work'
      };
      setOfficeTasks(prev => [newTask, ...prev]);
      setSimTaskTitle('');
    } else if (simReportType === 'fees') {
      if (!simFeeStudent.trim()) return;
      const newFee = {
        invoiceNo: 'INV-2026-0' + (feesDues.length + 1),
        student: simFeeStudent,
        course: simFeeCourse,
        amountPaid: Number(simFeePaid) || 0,
        amountDue: Number(simFeeDue) || 0,
        totalAmount: (Number(simFeePaid) || 0) + (Number(simFeeDue) || 0),
        paymentMode: 'Online',
        status: (Number(simFeeDue) || 0) === 0 ? 'Paid' : 'Partial',
        date: new Date().toISOString().split('T')[0],
        branch: selectedBranchFilter === 'All' ? 'Lucknow Main' : selectedBranchFilter
      };
      setFeesDues(prev => [newFee, ...prev]);
      setSimFeeStudent('');
    } else if (simReportType === 'attendance') {
      if (!simEmpName.trim()) return;
      const newAttendance = {
        empId: simEmpId || 'EMP-0' + (attendanceLate.length + 10),
        name: simEmpName,
        department: 'Operations',
        onTimeDays: 20,
        lateDays: Number(simEmpLateDays) || 0,
        workingDays: 26,
        lateRank: attendanceLate.length + 1,
        avgCheckIn: simEmpCheckIn,
        branch: selectedBranchFilter === 'All' ? 'Lucknow Main' : selectedBranchFilter
      };
      setAttendanceLate(prev => [newAttendance, ...prev]);
      setSimEmpName('');
    } else if (simReportType === 'performance') {
      if (!simEmpName.trim()) return;
      const newPerformance = {
        empId: simEmpId || 'EMP-0' + (appraisalScores.length + 10),
        employeeName: simEmpName,
        department: 'Operations',
        selfDevelopment: 80,
        decisionMaking: 82,
        productivityEfficiency: Number(simAppScore) || 80,
        finalScore: Number(simAppScore) || 80,
        rating: simAppRating,
        comments: simAppComments || 'Strong contribution.',
        reviewedBy: 'Dr. R. K. Pathak',
        month: 5,
        year: 2026,
        branch: selectedBranchFilter === 'All' ? 'Lucknow Main' : selectedBranchFilter
      };
      setAppraisalScores(prev => [newPerformance, ...prev]);
      setSimEmpName('');
    } else if (simReportType === 'roi') {
      if (!simCampName.trim()) return;
      const newCamp = {
        campaignName: simCampName,
        channel: simCampChannel,
        budget: Number(simCampBudget) || 0,
        leads: Number(simCampLeads) || 0,
        conversions: Number(simCampConversions) || 0,
        revenue: Number(simCampRevenue) || 0,
        isActive: 'Active'
      };
      setCampaignROI(prev => [newCamp, ...prev]);
      setSimCampName('');
    }
    setShowSimModal(false);
  };

  // Get active report metadata
  const activeReport = useMemo(() => {
    return reportsDef.find(r => r.id === activeReportTab);
  }, [activeReportTab]);

  // Handle Sort
  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // List of branches helper derived from database branches
  const branchesList = ['All', 'Lucknow Main', 'Hazratganj Centre', 'Aliganj Hub', 'Indira Nagar', 'Noida Extension'];

  // ==========================================
  // 2. DATA PROCESSING & FILTERING FOR EACH REPORT
  // ==========================================

  const processedData = useMemo(() => {
    let raw = [];
    if (activeReportTab === 'leads') raw = dailyLeads;
    else if (activeReportTab === 'branches') raw = branchAdmissions;
    else if (activeReportTab === 'tasks') raw = officeTasks;
    else if (activeReportTab === 'fees') raw = feesDues;
    else if (activeReportTab === 'attendance') raw = attendanceLate;
    else if (activeReportTab === 'performance') raw = appraisalScores;
    else if (activeReportTab === 'roi') raw = campaignROI;

    // Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      raw = raw.filter(item => {
        if (activeReportTab === 'leads') return item.date.includes(q);
        if (activeReportTab === 'branches') return item.branch.toLowerCase().includes(q);
        if (activeReportTab === 'tasks') return item.title.toLowerCase().includes(q) || item.assignedTo.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
        if (activeReportTab === 'fees') return item.student.toLowerCase().includes(q) || item.invoiceNo.toLowerCase().includes(q) || item.course.toLowerCase().includes(q);
        if (activeReportTab === 'attendance') return item.name.toLowerCase().includes(q) || item.department.toLowerCase().includes(q);
        if (activeReportTab === 'performance') return item.employeeName.toLowerCase().includes(q) || item.department.toLowerCase().includes(q);
        if (activeReportTab === 'roi') return item.campaignName.toLowerCase().includes(q) || item.channel.toLowerCase().includes(q);
        return false;
      });
    }

    // Branch filter (if applicable to record type)
    if (selectedBranchFilter !== 'All') {
      raw = raw.filter(item => {
        if (activeReportTab === 'branches') return item.branch === selectedBranchFilter;
        if (activeReportTab === 'tasks') return item.branch === selectedBranchFilter;
        if (activeReportTab === 'fees') return item.branch === selectedBranchFilter;
        if (activeReportTab === 'attendance') return item.branch === selectedBranchFilter;
        if (activeReportTab === 'performance') return item.branch === selectedBranchFilter;
        return true; // dailyLeads & campaignROI are centralized campaigns
      });
    }

    // Date Range filters
    if (dateRangeStart) {
      raw = raw.filter(item => {
        const itemDate = item.date || item.deadline || '';
        return itemDate >= dateRangeStart;
      });
    }
    if (dateRangeEnd) {
      raw = raw.filter(item => {
        const itemDate = item.date || item.deadline || '';
        return itemDate <= dateRangeEnd;
      });
    }

    // Sort sorting
    if (sortField) {
      raw = [...raw].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortDirection === 'asc'
            ? (valA || 0) - (valB || 0)
            : (valB || 0) - (valA || 0);
        }
      });
    }

    return raw;
  }, [
    activeReportTab, dailyLeads, branchAdmissions, officeTasks, feesDues,
    attendanceLate, appraisalScores, campaignROI, searchQuery,
    selectedBranchFilter, dateRangeStart, dateRangeEnd, sortField, sortDirection
  ]);

  // ==========================================
  // 3. STATISTICAL SUMMARIES GENERATION
  // ==========================================

  const summaryStats = useMemo(() => {
    if (activeReportTab === 'leads') {
      const totalLeads = processedData.reduce((acc, item) => acc + item.leads, 0);
      const totalConversions = processedData.reduce((acc, item) => acc + item.conversions, 0);
      const totalRevenue = processedData.reduce((acc, item) => acc + item.revenue, 0);
      const avgConversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0;
      return [
        { label: 'Total Inquiries', value: totalLeads.toLocaleString(), desc: 'Lead generation pipeline', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Conversions', value: totalConversions.toLocaleString(), desc: 'Enrolled students', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
        { label: 'Conversion Rate', value: `${avgConversionRate}%`, desc: 'Average closing efficiency', icon: Sparkles, color: 'text-yellow-500 bg-yellow-500/10' },
        { label: 'Attributed Sales', value: `₹${totalRevenue.toLocaleString()}`, desc: 'Total booking fees', icon: DollarSign, color: 'text-purple-500 bg-purple-500/10' }
      ];
    }
    if (activeReportTab === 'branches') {
      const totalEnrollments = processedData.reduce((acc, item) => acc + item.admissions, 0);
      const totalRev = processedData.reduce((acc, item) => acc + item.revenue, 0);
      const totalDues = processedData.reduce((acc, item) => acc + item.dues, 0);
      const targetPercent = processedData.length > 0
        ? ((totalEnrollments / processedData.reduce((acc, item) => acc + item.target, 0)) * 100).toFixed(1)
        : 0;
      return [
        { label: 'Total Admissions', value: totalEnrollments.toLocaleString(), desc: 'All regional branches', icon: Briefcase, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Collection Volume', value: `₹${totalRev.toLocaleString()}`, desc: 'Received admission amounts', icon: DollarSign, color: 'text-green-500 bg-green-500/10' },
        { label: 'Pending Dues', value: `₹${totalDues.toLocaleString()}`, desc: 'Receivable fee amounts', icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
        { label: 'Target Accomplished', value: `${targetPercent}%`, desc: 'Of unified sales quotas', icon: Trophy, color: 'text-yellow-500 bg-yellow-500/10' }
      ];
    }
    if (activeReportTab === 'tasks') {
      const overdue = processedData.filter(t => t.status === 'Overdue').length;
      const pending = processedData.filter(t => t.status === 'Pending').length;
      const totalTasks = processedData.length;
      return [
        { label: 'All Tracked Tasks', value: totalTasks, desc: 'Office operational checklist', icon: ClipboardList, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Overdue Worklist', value: overdue, desc: 'Enforce immediate action', icon: AlertCircle, color: 'text-red-500 bg-red-500/10 animate-pulse' },
        { label: 'Pending Worklist', value: pending, desc: 'Ongoing workflow items', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
        { label: 'Office Health Index', value: totalTasks > 0 ? `${Math.round(((totalTasks - overdue) / totalTasks) * 100)}%` : '100%', desc: 'Tasks on schedule ratio', icon: Activity, color: 'text-green-500 bg-green-500/10' }
      ];
    }
    if (activeReportTab === 'fees') {
      const collected = processedData.reduce((acc, item) => acc + item.amountPaid, 0);
      const dues = processedData.reduce((acc, item) => acc + item.amountDue, 0);
      const collectedPercent = (collected + dues) > 0 ? ((collected / (collected + dues)) * 100).toFixed(1) : 100;
      return [
        { label: 'Fees Collected', value: `₹${collected.toLocaleString()}`, desc: 'Net realized income', icon: DollarSign, color: 'text-green-500 bg-green-500/10' },
        { label: 'Active Outstanding Dues', value: `₹${dues.toLocaleString()}`, desc: 'Student accounts balance', icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
        { label: 'Collection Rate', value: `${collectedPercent}%`, desc: 'Realization percentage', icon: Activity, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Invoiced Accounts', value: processedData.length, desc: 'Active student ledger records', icon: FileText, color: 'text-purple-500 bg-purple-500/10' }
      ];
    }
    if (activeReportTab === 'attendance') {
      const totalLateDays = processedData.reduce((acc, item) => acc + item.lateDays, 0);
      const totalWorkingDays = processedData.reduce((acc, item) => acc + item.workingDays, 0);
      const overallLateness = totalWorkingDays > 0 ? ((totalLateDays / totalWorkingDays) * 100).toFixed(1) : 0;
      const topLateComer = [...processedData].sort((a, b) => b.lateDays - a.lateDays)[0];
      return [
        { label: 'Employee Strength', value: processedData.length, desc: 'Tracked attendance rosters', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Late Mark Incidences', value: totalLateDays, desc: 'Check-ins past 09:30 AM limit', icon: Clock, color: 'text-orange-500 bg-orange-500/10' },
        { label: 'Late mark Ratio', value: `${overallLateness}%`, desc: 'Average staff late metric', icon: Activity, color: 'text-purple-500 bg-purple-500/10' },
        { label: 'Highest Lateness', value: topLateComer ? `${topLateComer.name} (${topLateComer.lateDays}d)` : '-', desc: 'Flagged for late review counseling', icon: AlertCircle, color: 'text-red-500 bg-red-500/10' }
      ];
    }
    if (activeReportTab === 'performance') {
      const scores = processedData.map(item => item.finalScore);
      const avgPerformance = scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length) : 0;
      const topAppraised = [...processedData].sort((a, b) => b.finalScore - a.finalScore)[0];
      return [
        { label: 'Evaluated Staff', value: processedData.length, desc: 'Appraisal audit reviews', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Mean Appraisal Score', value: `${avgPerformance}%`, desc: 'Consolidated staff score index', icon: Activity, color: 'text-green-500 bg-green-500/10' },
        { label: 'Star Top Performer', value: topAppraised ? topAppraised.employeeName : '-', desc: 'Highest evaluation rating', icon: Trophy, color: 'text-yellow-500 bg-yellow-500/10' },
        { label: 'Star Score Rating', value: topAppraised ? `${topAppraised.finalScore}% (${topAppraised.rating})` : '-', desc: 'Targeting standard scores', icon: Award, color: 'text-purple-500 bg-purple-500/10' }
      ];
    }
    if (activeReportTab === 'roi') {
      const budget = processedData.reduce((acc, item) => acc + item.budget, 0);
      const leads = processedData.reduce((acc, item) => acc + item.leads, 0);
      const conversions = processedData.reduce((acc, item) => acc + item.conversions, 0);
      const revenue = processedData.reduce((acc, item) => acc + item.revenue, 0);
      const cpl = leads > 0 ? Math.round(budget / leads) : 0;
      const roi = budget > 0 ? Math.round(((revenue - budget) / budget) * 100) : 0;
      return [
        { label: 'Campaign Budget', value: `₹${budget.toLocaleString()}`, desc: 'Total advertisement costs', icon: DollarSign, color: 'text-blue-500 bg-blue-500/10' },
        { label: 'Admissions Cost (CPA)', value: conversions > 0 ? `₹${Math.round(budget / conversions).toLocaleString()}` : '0', desc: 'Average cost per admission', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
        { label: 'Cost Per Lead (CPL)', value: `₹${cpl.toLocaleString()}`, desc: 'Inquiry sourcing cost', icon: TrendingUp, color: 'text-yellow-500 bg-yellow-500/10' },
        { label: 'ROI Sourcing Yield', value: `${roi}%`, desc: 'Average campaign revenue return', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' }
      ];
    }
    return [];
  }, [activeReportTab, processedData]);

  // ==========================================
  // 4. DOWNLOAD EXPORT TO CSV HELPER
  // ==========================================

  const handleExportCSV = () => {
    if (processedData.length === 0) return;
    
    // Create clean headers
    let headers = [];
    if (activeReportTab === 'leads') headers = ['Date', 'Total Leads', 'Conversions', 'Hot Leads', 'Warm Leads', 'Cold Leads', 'Attributed Revenue'];
    else if (activeReportTab === 'branches') headers = ['Branch', 'Admissions', 'Admissions Target', 'Collection Revenue', 'Pending Dues', 'CCC', 'Tally', 'Python', 'Web Dev', 'O Level'];
    else if (activeReportTab === 'tasks') headers = ['Task ID', 'Title', 'Description', 'Deadline', 'Assigned To', 'Status', 'Priority', 'Branch', 'Category'];
    else if (activeReportTab === 'fees') headers = ['Invoice No', 'Student Name', 'Course', 'Amount Paid', 'Amount Due', 'Total Amount', 'Payment Mode', 'Status', 'Transaction Date', 'Branch'];
    else if (activeReportTab === 'attendance') headers = ['Employee ID', 'Employee Name', 'Department', 'On-Time Days', 'Late Days', 'Working Days', 'Avg Check-In', 'Branch'];
    else if (activeReportTab === 'performance') headers = ['Employee ID', 'Employee Name', 'Department', 'Self Dev Score', 'Decision Score', 'Productivity Score', 'Final Appraisal Score', 'Appraisal Rating', 'Reviewer Comments', 'Reviewer Name', 'Branch'];
    else if (activeReportTab === 'roi') headers = ['Campaign Name', 'Channel Sourcing', 'Budget (INR)', 'Leads Sourced', 'Conversions', 'Attributed Revenue', 'ROI (%)', 'Status'];

    // Map rows
    const rows = processedData.map(item => {
      if (activeReportTab === 'leads') return [item.date, item.leads, item.conversions, item.hot, item.warm, item.cold, item.revenue];
      if (activeReportTab === 'branches') return [item.branch, item.admissions, item.target, item.revenue, item.dues, item.ccc, item.tally, item.python, item.webdev, item.olevel];
      if (activeReportTab === 'tasks') return [item.id, item.title, item.description, item.deadline, item.assignedTo, item.status, item.priority, item.branch, item.category];
      if (activeReportTab === 'fees') return [item.invoiceNo, item.student, item.course, item.amountPaid, item.amountDue, item.totalAmount, item.paymentMode, item.status, item.date, item.branch];
      if (activeReportTab === 'attendance') return [item.empId, item.name, item.department, item.onTimeDays, item.lateDays, item.workingDays, item.avgCheckIn, item.branch];
      if (activeReportTab === 'performance') return [item.empId, item.employeeName, item.department, item.selfDevelopment, item.decisionMaking, item.productivityEfficiency, item.finalScore, item.rating, item.comments, item.reviewedBy, item.branch];
      if (activeReportTab === 'roi') {
        const cBudget = item.budget || 0;
        const cRev = item.revenue || 0;
        const roiVal = cBudget > 0 ? Math.round(((cRev - cBudget) / cBudget) * 100) : 0;
        return [item.campaignName, item.channel, item.budget, item.leads, item.conversions, item.revenue, `${roiVal}%`, item.isActive];
      }
      return [];
    });

    // Make CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => {
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','))
    ].join('\n');

    // Create download element
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `IMS_Management_Report_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Card classes based on Dark Mode state
  const containerCls = `p-4 sm:p-6 min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`;
  const cardCls = `rounded-xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${
    isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  }`;
  const inputCls = `block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
    isDarkMode ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
  }`;

  return (
    <div className={containerCls}>
      {/* 🚀 HEADER BLOCK */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Management Reports Hub</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                Centralized executive portal for multi-branch monitoring, CRM trends, office workflows, and EMS staff rosters.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSimReportType(activeReportTab);
              setShowSimModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Simulate Sandbox Data
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={processedData.length === 0}
            className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl shadow border transition-all cursor-pointer ${
              processedData.length === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
            }`}
          >
            <Download className="h-4 w-4" /> Export CSV Grid
          </button>
        </div>
      </div>

      {/* 🚀 MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==========================================
            LEFT SIDE BAR: 7 REPORTS TAB CONTROLLER
           ========================================== */}
        <div className="lg:col-span-3 flex flex-col gap-2 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-2">
            Executive Report Categories
          </p>
          {reportsDef.map((rep) => {
            const IconComp = rep.icon;
            const isActive = activeReportTab === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => {
                  setActiveReportTab(rep.id);
                  setSortField('');
                  setSortDirection('asc');
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors mt-0.5 ${
                  isActive ? 'bg-white/10 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-blue-500'
                }`}>
                  <IconComp className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate leading-tight">{rep.title}</span>
                    <ChevronRight className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <span className={`text-[10px] block mt-0.5 truncate uppercase tracking-wider opacity-80 ${
                    isActive ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {rep.dbSource.split(' ')[0]} Source
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ==========================================
            RIGHT SIDE AREA: DETAILS, CHARTS, TABLES
           ========================================== */}
        <div className="lg:col-span-9 space-y-6">

          {/* Active Tab Info Box */}
          <div className={`${cardCls} relative overflow-hidden border-l-4 border-l-blue-600`}>
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-600/10 text-blue-600 rounded-full">
                    {activeReport.dbSource}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-600/10 text-purple-600 rounded-full flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" /> Sandbox Sync
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-2">{activeReport.title} Report</h2>
                <p className={`text-sm mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeReport.desc}
                </p>
              </div>
            </div>
          </div>

          {/* KPI METRIC CARDS ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map((kpi, idx) => {
              const IconKpi = kpi.icon;
              return (
                <div key={idx} className={cardCls}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      {kpi.label}
                    </span>
                    <span className={`p-2 rounded-lg ${kpi.color}`}>
                      <IconKpi className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold mt-2 truncate tracking-tight">{kpi.value}</p>
                  <p className={`text-[10px] mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{kpi.desc}</p>
                </div>
              );
            })}
          </div>

          {/* VISUAL CHART AREA */}
          <div className={cardCls}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-400 dark:text-gray-500">
              Visual Trend Analytics
            </h3>
            
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeReportTab === 'leads' ? (
                  <AreaChart data={dailyLeads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Legend style={{ fontSize: 12 }} />
                    <Area type="monotone" name="Inquiries Sourced" dataKey="leads" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                    <Area type="monotone" name="Conversions/Admissions" dataKey="conversions" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                  </AreaChart>
                ) : activeReportTab === 'branches' ? (
                  <BarChart data={branchAdmissions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="branch" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 10 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Legend style={{ fontSize: 12 }} />
                    <Bar name="Enrollments" dataKey="admissions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar name="Monthly Target" dataKey="target" fill="#9CA3AF" opacity={0.5} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : activeReportTab === 'tasks' ? (
                  <BarChart data={Object.entries(officeTasks.reduce((acc, curr) => {
                    acc[curr.branch] = (acc[curr.branch] || 0) + 1;
                    return acc;
                  }, {})).map(([name, count]) => ({ name, count }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 10 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Bar name="Back-Office Tasks" dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : activeReportTab === 'fees' ? (
                  <LineChart data={feesDues} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="student" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 10 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Legend style={{ fontSize: 12 }} />
                    <Line type="monotone" name="Paid Volume" dataKey="amountPaid" stroke="#10B981" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    <Line type="monotone" name="Dues Balance" dataKey="amountDue" stroke="#EF4444" strokeWidth={2.5} />
                  </LineChart>
                ) : activeReportTab === 'attendance' ? (
                  <BarChart data={attendanceLate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 10 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Legend style={{ fontSize: 12 }} />
                    <Bar name="Lateness Instances" dataKey="lateDays" fill="#F97316" radius={[4, 4, 0, 0]} />
                    <Bar name="On-Time Rosters" dataKey="onTimeDays" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : activeReportTab === 'performance' ? (
                  <BarChart data={appraisalScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="employeeName" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 10 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Legend style={{ fontSize: 12 }} />
                    <Bar name="Appraisal Score (%)" dataKey="finalScore" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    <Bar name="Discipline Score" dataKey="disciplineScore" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={campaignROI} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
                    <XAxis dataKey="campaignName" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 9 }} />
                    <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }} />
                    <Legend style={{ fontSize: 12 }} />
                    <Bar name="Revenue Attributed" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar name="Budget Invested" dataKey="budget" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* ADVANCED ADVOCATE FILTERING TOOLBAR */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Interactive Grid Filter Console
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sourcing Query Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Instant text lookup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputCls} pl-10`}
                />
              </div>

              {/* Regional Branch selector */}
              <div>
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className={inputCls}
                >
                  {branchesList.map((br) => (
                    <option key={br} value={br}>{br === 'All' ? 'Global Branches' : br}</option>
                  ))}
                </select>
              </div>

              {/* Sourcing Start Date */}
              <div>
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className={inputCls}
                  placeholder="Start date"
                />
              </div>

              {/* Sourcing End Date */}
              <div>
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className={inputCls}
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Active Filters Clear Button */}
            {(searchQuery || selectedBranchFilter !== 'All' || dateRangeStart || dateRangeEnd) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBranchFilter('All');
                    setDateRangeStart('');
                    setDateRangeEnd('');
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Clear Active Filters
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC TABULAR DATA ROSTER */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Detailed Roster Records ({processedData.length})
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Click column headers to toggle sort criteria
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-sm border-collapse">
                <thead className={`text-xs uppercase font-semibold ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <tr>
                    {activeReportTab === 'leads' ? (
                      <>
                        <th onClick={() => handleSort('date')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Date {sortField === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('leads')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Total Leads {sortField === 'leads' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('conversions')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Admissions {sortField === 'conversions' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th className="px-4 py-3">Warm / Hot Levels</th>
                        <th onClick={() => handleSort('revenue')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Estimated Revenue {sortField === 'revenue' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                      </>
                    ) : activeReportTab === 'branches' ? (
                      <>
                        <th onClick={() => handleSort('branch')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Branch Name {sortField === 'branch' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('admissions')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Enrollments {sortField === 'admissions' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('target')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Target Admissions {sortField === 'target' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('revenue')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Collected (INR) {sortField === 'revenue' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('dues')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Dues (INR) {sortField === 'dues' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                      </>
                    ) : activeReportTab === 'tasks' ? (
                      <>
                        <th className="px-4 py-3">Task ID</th>
                        <th className="px-4 py-3">Roster Title</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th onClick={() => handleSort('deadline')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Deadline {sortField === 'deadline' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    ) : activeReportTab === 'fees' ? (
                      <>
                        <th className="px-4 py-3">Invoice No</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Course</th>
                        <th onClick={() => handleSort('amountPaid')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Paid {sortField === 'amountPaid' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('amountDue')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Dues {sortField === 'amountDue' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th className="px-4 py-3">Billing Status</th>
                      </>
                    ) : activeReportTab === 'attendance' ? (
                      <>
                        <th className="px-4 py-3">Emp ID</th>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th onClick={() => handleSort('lateDays')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Late Mark Count {sortField === 'lateDays' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th className="px-4 py-3">Avg Check-In</th>
                        <th className="px-4 py-3">Lateness Index</th>
                      </>
                    ) : activeReportTab === 'performance' ? (
                      <>
                        <th className="px-4 py-3">Emp ID</th>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th onClick={() => handleSort('finalScore')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Appraisal Score {sortField === 'finalScore' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th className="px-4 py-3">Rating Status</th>
                        <th className="px-4 py-3">Reviewer Name</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3">Campaign Name</th>
                        <th className="px-4 py-3">Channel Sourcing</th>
                        <th onClick={() => handleSort('budget')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Budget (INR) {sortField === 'budget' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('leads')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Leads {sortField === 'leads' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleSort('conversions')} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700">Conversions {sortField === 'conversions' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                        <th className="px-4 py-3">Net ROI Return</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className={isDarkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-200'}>
                  {processedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No report entries match your filters. Use "Simulate Sandbox Data" to insert metrics!
                      </td>
                    </tr>
                  ) : (
                    processedData.map((item, index) => (
                      <tr key={index} className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-850' : 'hover:bg-gray-50'
                      }`}>
                        {activeReportTab === 'leads' ? (
                          <>
                            <td className="px-4 py-3.5 font-medium">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3.5 font-semibold text-blue-600 dark:text-blue-400">{item.leads}</td>
                            <td className="px-4 py-3.5 font-semibold text-green-600 dark:text-green-400">{item.conversions}</td>
                            <td className="px-4 py-3.5 text-xs">
                              <span className="text-orange-500 font-bold">{item.hot} Hot</span> / <span className="text-yellow-500 font-semibold">{item.warm} Warm</span>
                            </td>
                            <td className="px-4 py-3.5 font-bold">₹{item.revenue.toLocaleString()}</td>
                          </>
                        ) : activeReportTab === 'branches' ? (
                          <>
                            <td className="px-4 py-3.5 font-semibold">{item.branch}</td>
                            <td className="px-4 py-3.5 text-blue-600 dark:text-blue-400 font-bold">{item.admissions}</td>
                            <td className="px-4 py-3.5 text-gray-500">{item.target}</td>
                            <td className="px-4 py-3.5 text-green-600 dark:text-green-400 font-bold">₹{item.revenue.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-red-500 font-bold">₹{item.dues.toLocaleString()}</td>
                          </>
                        ) : activeReportTab === 'tasks' ? (
                          <>
                            <td className="px-4 py-3.5 text-xs font-bold text-gray-400">{item.id}</td>
                            <td className="px-4 py-3.5 font-medium">
                              <div>
                                <p className="font-semibold text-sm leading-snug">{item.title}</p>
                                <p className={`text-[10px] truncate max-w-[200px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.description}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs">{item.assignedTo}</td>
                            <td className="px-4 py-3.5 text-xs">{new Date(item.deadline).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.priority === 'High' ? 'bg-red-500/10 text-red-500' : item.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.status === 'Overdue' ? 'bg-red-600/10 text-red-500 animate-pulse' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        ) : activeReportTab === 'fees' ? (
                          <>
                            <td className="px-4 py-3.5 text-xs font-bold text-gray-400">{item.invoiceNo}</td>
                            <td className="px-4 py-3.5 font-semibold">{item.student}</td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">{item.course}</td>
                            <td className="px-4 py-3.5 text-green-600 dark:text-green-400 font-bold">₹{item.amountPaid.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-red-500 font-bold">₹{item.amountDue.toLocaleString()}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.status === 'Paid' ? 'bg-green-500/10 text-green-500' : item.status === 'Partial' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        ) : activeReportTab === 'attendance' ? (
                          <>
                            <td className="px-4 py-3.5 text-xs font-bold text-gray-400">{item.empId}</td>
                            <td className="px-4 py-3.5 font-semibold">{item.name}</td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">{item.department}</td>
                            <td className="px-4 py-3.5 text-orange-500 font-bold">{item.lateDays} Late Mark Days</td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">{item.avgCheckIn}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.lateDays >= 5 ? 'bg-red-500/10 text-red-500 font-extrabold' : item.lateDays >= 2 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                              }`}>
                                {item.lateDays >= 5 ? 'CRITICAL LATE' : item.lateDays >= 2 ? 'WARNING LATE' : 'EXCELLENT'}
                              </span>
                            </td>
                          </>
                        ) : activeReportTab === 'performance' ? (
                          <>
                            <td className="px-4 py-3.5 text-xs font-bold text-gray-400">{item.empId}</td>
                            <td className="px-4 py-3.5 font-semibold">{item.employeeName}</td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">{item.department}</td>
                            <td className="px-4 py-3.5 font-bold text-pink-500">{item.finalScore}%</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.rating === 'Outstanding' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {item.rating}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">{item.reviewedBy}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3.5 font-semibold">
                              <div>
                                <p className="font-semibold text-sm leading-snug">{item.campaignName}</p>
                                <p className={`text-[10px] uppercase font-bold mt-0.5 ${
                                  item.channel === 'Meta' ? 'text-blue-500' : item.channel === 'Google' ? 'text-green-500' : 'text-purple-500'
                                }`}>{item.channel} Channel</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">{item.channel}</td>
                            <td className="px-4 py-3.5 font-semibold">₹{item.budget.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-blue-500 font-semibold">{item.leads}</td>
                            <td className="px-4 py-3.5 text-green-500 font-bold">{item.conversions}</td>
                            <td className="px-4 py-3.5 font-bold">
                              {(() => {
                                const roiVal = item.budget > 0 ? Math.round(((item.revenue - item.budget) / item.budget) * 100) : 0;
                                return (
                                  <span className={roiVal >= 100 ? 'text-green-500' : roiVal >= 0 ? 'text-yellow-500' : 'text-red-500'}>
                                    ₹{item.revenue.toLocaleString()} ({roiVal}%)
                                  </span>
                                );
                              })()}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          5. INTERACTIVE SANDBOX SIMULATOR MODAL PANEL
         ========================================== */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className={`relative z-10 w-full max-w-lg rounded-2xl shadow-2xl border p-6 overflow-y-auto max-h-[90vh] ${
                isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Simulate Sandbox Reports
              </h2>

              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-5 leading-relaxed`}>
                Insert specialized metrics directly into the frontend state to demonstrate client-side reporting logic, filters, Recharts compilation, and CSV exporters.
              </p>

              <form onSubmit={handleSimulateSubmit} className="space-y-4">
                
                {/* Simulated category type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
                    Target Report Category
                  </label>
                  <select
                    value={simReportType}
                    onChange={(e) => setSimReportType(e.target.value)}
                    className={inputCls}
                  >
                    {reportsDef.map(rep => (
                      <option key={rep.id} value={rep.id}>{rep.title}</option>
                    ))}
                  </select>
                </div>

                <hr className={isDarkMode ? 'border-gray-800' : 'border-gray-200'} />

                {/* 1. Daily Leads simulation form */}
                {simReportType === 'leads' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Calendar Date</label>
                      <input type="date" value={simLeadDate} onChange={e => setSimLeadDate(e.target.value)} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Total Leads Sourced</label>
                        <input type="number" value={simLeadCount} onChange={e => setSimLeadCount(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Conversions</label>
                        <input type="number" value={simLeadConversions} onChange={e => setSimLeadConversions(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Attributed Sourced Revenue (INR)</label>
                      <input type="number" value={simLeadRevenue} onChange={e => setSimLeadRevenue(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}

                {/* 2. Branch admission summary simulation */}
                {simReportType === 'branches' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Select Target Branch</label>
                      <select value={simBranchName} onChange={e => setSimBranchName(e.target.value)} className={inputCls}>
                        {branchesList.filter(b => b !== 'All').map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">New Enrollments</label>
                        <input type="number" value={simBranchAdmissions} onChange={e => setSimBranchAdmissions(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">New Collection Revenue</label>
                        <input type="number" value={simBranchRevenue} onChange={e => setSimBranchRevenue(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Office tasks simulation */}
                {simReportType === 'tasks' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Roster Task Title</label>
                      <input type="text" placeholder="e.g. Generate Batch Certificates..." value={simTaskTitle} onChange={e => setSimTaskTitle(e.target.value)} className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Assigned Executive Staff</label>
                      <input type="text" placeholder="e.g. Ramesh Chandra" value={simTaskAssigned} onChange={e => setSimTaskAssigned(e.target.value)} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Branch</label>
                        <select value={simTaskBranch} onChange={e => setSimTaskBranch(e.target.value)} className={inputCls}>
                          {branchesList.filter(b => b !== 'All').map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Task Priority</label>
                        <select value={simTaskPriority} onChange={e => setSimTaskPriority(e.target.value)} className={inputCls}>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Workflow Status</label>
                      <select value={simTaskStatus} onChange={e => setSimTaskStatus(e.target.value)} className={inputCls}>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Fee Collections and dues simulation */}
                {simReportType === 'fees' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Student Name</label>
                      <input type="text" placeholder="e.g. Aarav Mehta" value={simFeeStudent} onChange={e => setSimFeeStudent(e.target.value)} className={inputCls} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Course Code</label>
                        <input type="text" placeholder="e.g. Python Prime" value={simFeeCourse} onChange={e => setSimFeeCourse(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Amount Paid (INR)</label>
                        <input type="number" value={simFeePaid} onChange={e => setSimFeePaid(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Amount Due Outstanding (INR)</label>
                      <input type="number" value={simFeeDue} onChange={e => setSimFeeDue(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}

                {/* 5. Employee attendance lateness simulation */}
                {simReportType === 'attendance' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Staff Name</label>
                        <input type="text" placeholder="e.g. Vikram Aditya" value={simEmpName} onChange={e => setSimEmpName(e.target.value)} className={inputCls} required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Staff ID</label>
                        <input type="text" placeholder="EMP-035" value={simEmpId} onChange={e => setSimEmpId(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Late mark Days</label>
                        <input type="number" value={simEmpLateDays} onChange={e => setSimEmpLateDays(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Average Check-in Time</label>
                        <input type="text" placeholder="09:40 AM" value={simEmpCheckIn} onChange={e => setSimEmpCheckIn(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Employee Appraisal scoreboard leaderboard simulation */}
                {simReportType === 'performance' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Employee Name</label>
                        <input type="text" placeholder="e.g. Meenakshi Iyer" value={simEmpName} onChange={e => setSimEmpName(e.target.value)} className={inputCls} required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Staff ID</label>
                        <input type="text" placeholder="EMP-005" value={simEmpId} onChange={e => setSimEmpId(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Final Score Percentage</label>
                        <input type="number" placeholder="90" min="0" max="100" value={simAppScore} onChange={e => setSimAppScore(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Appraisal Rating</label>
                        <select value={simAppRating} onChange={e => setSimAppRating(e.target.value)} className={inputCls}>
                          <option value="Outstanding">Outstanding</option>
                          <option value="Very Good">Very Good</option>
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Reviewer Commendations</label>
                      <input type="text" placeholder="Strong contribution to sales..." value={simAppComments} onChange={e => setSimAppComments(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}

                {/* 7. Marketing ROI simulation */}
                {simReportType === 'roi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Campaign Name</label>
                      <input type="text" placeholder="e.g. Meta Summer admissions..." value={simCampName} onChange={e => setSimCampName(e.target.value)} className={inputCls} required />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Channel</label>
                        <select value={simCampChannel} onChange={e => setSimCampChannel(e.target.value)} className={inputCls}>
                          <option value="Meta">Meta</option>
                          <option value="Google">Google</option>
                          <option value="Offline">Offline</option>
                          <option value="Referral">Referral</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Leads</label>
                        <input type="number" value={simCampLeads} onChange={e => setSimCampLeads(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Conversions</label>
                        <input type="number" value={simCampConversions} onChange={e => setSimCampConversions(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Invested Budget (INR)</label>
                        <input type="number" value={simCampBudget} onChange={e => setSimCampBudget(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Total Revenue Sourced</label>
                        <input type="number" value={simCampRevenue} onChange={e => setSimCampRevenue(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSimModal(false)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow cursor-pointer transition-all active:scale-[0.97]"
                  >
                    Inject Sandbox Entry
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
