import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, CheckCircle2, AlertCircle, Clock, 
  Users, BarChart2, ChevronRight, Award, RefreshCw 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useThemeStore } from '../../store';
import API from '../../services/API';
import WorkflowDetailsDrawer from './components/WorkflowDetailsDrawer';

export default function WorkflowDashboard() {
  const { isDarkMode } = useThemeStore();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters & Search State
  const [keyword, setKeyword] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [lifecycleStatus, setLifecycleStatus] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Statistics State
  const [stats, setStats] = useState({
    totalChecklists: 0,
    overdueChecklists: 0,
    completedChecklists: 0,
    activeChecklists: 0,
    lifecycleCounts: {
      Prospect: 0,
      Applied: 0,
      Admitted: 0,
      Active: 0,
      Inactive: 0,
      Dropped: 0,
      Completed: 0
    }
  });

  // Selected student for drawer
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load Workflows data
  const loadWorkflows = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch paginated filtered workflows
      const params = {
        page,
        limit,
        keyword: keyword || undefined,
        status: taskStatus || undefined,
        lifecycleStatus: lifecycleStatus || undefined
      };
      
      const res = await API.workflows.getAll(params);
      if (res.success) {
        setWorkflows(res.workflows || []);
        setTotalCount(res.totalCount || 0);
      }

      // 2. Fetch all admissions to compile full metrics and pipeline chart
      const allAdmissionsRes = await API.admissions.getAll({ limit: 1000 });
      const admissionsList = allAdmissionsRes.admissions || [];

      // Calculate lifecycle status counts
      const lifecycleCounts = {
        Prospect: 0,
        Applied: 0,
        Admitted: 0,
        Active: 0,
        Inactive: 0,
        Dropped: 0,
        Completed: 0
      };

      admissionsList.forEach(adm => {
        const status = adm.lifecycleStatus || 'Applied';
        if (lifecycleCounts[status] !== undefined) {
          lifecycleCounts[status]++;
        }
      });

      // Calculate task checklist metrics from all workflows
      const allWorkflowsRes = await API.workflows.getAll({ limit: 1000 });
      const allWorkflows = allWorkflowsRes.workflows || [];
      
      let overdue = 0;
      let completed = 0;
      let active = 0;

      allWorkflows.forEach(wf => {
        const isDone = wf.tasks.every(t => t.status === 'Done');
        const hasOverdue = wf.tasks.some(t => t.status === 'Overdue');
        
        if (isDone) completed++;
        else active++;

        if (hasOverdue) overdue++;
      });

      setStats({
        totalChecklists: allWorkflows.length,
        overdueChecklists: overdue,
        completedChecklists: completed,
        activeChecklists: active,
        lifecycleCounts
      });

    } catch (err) {
      console.error('Failed to load workflows or admissions', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [page, taskStatus, lifecycleStatus]);

  // Handle manual trigger search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadWorkflows();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setTaskStatus('');
    setLifecycleStatus('');
    setPage(1);
  };

  const handleOpenDrawer = (admissionId) => {
    setSelectedAdmissionId(admissionId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAdmissionId(null);
  };

  // Compile data for Recharts Bar Chart
  const pipelineChartData = [
    { name: 'Prospect', count: stats.lifecycleCounts.Prospect, color: '#38bdf8' },
    { name: 'Applied', count: stats.lifecycleCounts.Applied, color: '#fbbf24' },
    { name: 'Admitted', count: stats.lifecycleCounts.Admitted, color: '#6366f1' },
    { name: 'Active', count: stats.lifecycleCounts.Active, color: '#10b981' },
    { name: 'Inactive', count: stats.lifecycleCounts.Inactive, color: '#94a3b8' },
    { name: 'Dropped', count: stats.lifecycleCounts.Dropped, color: '#f43f5e' },
    { name: 'Completed', count: stats.lifecycleCounts.Completed, color: '#a855f7' }
  ];

  // Helper to compute progress bar details
  const getProgressDetails = (tasks = []) => {
    const total = tasks.length || 6;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const percentage = Math.round((completed / total) * 100);
    
    // Find active task (first non-done task)
    const activeTask = tasks.find(t => t.status !== 'Done') || tasks[tasks.length - 1];
    
    return { completed, total, percentage, activeTaskTitle: activeTask?.title || 'None' };
  };

  const lifecycleColors = {
    Prospect: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25',
    Applied: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/25',
    Admitted: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/25',
    Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/25',
    Inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/25',
    Dropped: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/25',
    Completed: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/25',
  };

  return (
    <div className="p-4 space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Office Onboarding Workflow
            </span>
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage post-admission checklists, student statuses, and track lifecycle transitions.
          </p>
        </div>
        <button 
          onClick={() => loadWorkflows(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Sync Workflow'}
        </button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500"><Users className="w-6 h-6" /></div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Active Onboardings</span>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.activeChecklists}</h4>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500"><Clock className="w-6 h-6 animate-pulse" /></div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Pending Stages</span>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.totalChecklists - stats.completedChecklists}</h4>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Overdue Tasks</span>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.overdueChecklists}</h4>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Completed Onboarding</span>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.completedChecklists}</h4>
          </div>
        </motion.div>
      </div>

      {/* Row: Graph Pipeline & Status Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Pipeline Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl p-4 shadow-sm lg:col-span-8">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Student Status Lifecycle Pipeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155/30' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: 12,
                    borderRadius: 8
                  }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                  {pipelineChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Status Tailored Guide */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 dark:from-slate-950 dark:to-slate-900 border border-slate-200/10 rounded-xl p-5 shadow-sm text-white lg:col-span-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-white/10 text-indigo-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Smart Reminders Dispatch
            </span>
            <h3 className="text-base font-bold mt-2">Status-Driven Followups</h3>
            <p className="text-xs text-indigo-200/80 mt-1.5 leading-relaxed">
              Tailored notifications are dispatched automatically based on the student's active onboarding stage:
            </p>
            <ul className="space-y-2 mt-4 text-[11px] text-indigo-100/90">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                <span><b>Applied</b>: Prompts student to submit required documents immediately.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0" />
                <span><b>Admitted</b>: Sends alerts about pending tuition fees and collects receipts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><b>Active</b>: Standard academic dispatches (exams, rosters).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0" />
                <span><b>Completed</b>: Distributes certificates and verifies alumni records.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-white/10 mt-4 text-[10px] text-indigo-300">
            * Complete onboarding checklist stages to automatically upgrade the student lifecycle state.
          </div>
        </div>

      </div>

      {/* Advanced Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex items-center">
          <input
            type="text"
            placeholder="Search by student name, email, or Reg No..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <button 
            type="submit" 
            className="absolute right-1 px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
          >
            Find
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Task Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Task Status:
            </span>
            <select
              value={taskStatus}
              onChange={(e) => { setTaskStatus(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Student Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Student status:
            </span>
            <select
              value={lifecycleStatus}
              onChange={(e) => { setLifecycleStatus(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {['Prospect', 'Applied', 'Admitted', 'Active', 'Inactive', 'Dropped', 'Completed'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            Reset
          </button>

        </div>

      </div>

      {/* Main Workflows Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-slate-500">Loading student checklists...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Records Found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No post-admission workflow checklist matches your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Course Enrolled</th>
                  <th className="py-3 px-4">Lifecycle status</th>
                  <th className="py-3 px-4">Onboarding Progress</th>
                  <th className="py-3 px-4">Active Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {workflows.map((wf) => {
                  const student = wf.admission || {};
                  const { percentage, completed, total, activeTaskTitle } = getProgressDetails(wf.tasks);
                  const isComplete = completed === total;
                  const isOverdue = wf.tasks.some(t => t.status === 'Overdue');
                  
                  return (
                    <tr 
                      key={wf._id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all ${
                        isOverdue ? 'bg-rose-500/[0.01]' : ''
                      }`}
                    >
                      
                      {/* Student details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {student.fullName?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm hover:underline cursor-pointer" onClick={() => handleOpenDrawer(student._id)}>
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                              ID: {student.generatedRegNo || student.formNo || 'N/A'} • {student.emailAddress || 'No Email'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {student.courseApplied || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Center: {student.centerCode || 'Main Branch'}
                        </span>
                      </td>

                      {/* Lifecycle Pill */}
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase font-extrabold tracking-wider border px-2 py-0.5 rounded-full ${
                          lifecycleColors[student.lifecycleStatus || 'Applied']
                        }`}>
                          {student.lifecycleStatus || 'Applied'}
                        </span>
                      </td>

                      {/* Onboarding Progress */}
                      <td className="py-3 px-4 w-44">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            <span>{completed}/{total} Stages</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isComplete 
                                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                                  : isOverdue 
                                    ? 'bg-gradient-to-r from-rose-400 to-rose-500 animate-pulse' 
                                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Active Stage */}
                      <td className="py-3 px-4">
                        {isComplete ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            All Stages Finalized
                          </span>
                        ) : (
                          <div>
                            <span className={`font-semibold block ${isOverdue ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                              {activeTaskTitle}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block mt-0.5">
                              Next Due Step
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDrawer(student._id)}
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 py-1.5 px-3 rounded-lg hover:bg-indigo-500/5 transition-all"
                        >
                          View Checklist
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalCount > limit && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-950/20">
            <span>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} records</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold bg-white dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= totalCount}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold bg-white dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Details Slide-out Sheet Panel */}
      <WorkflowDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        admissionId={selectedAdmissionId}
        onWorkflowUpdated={loadWorkflows}
      />

    </div>
  );
}
