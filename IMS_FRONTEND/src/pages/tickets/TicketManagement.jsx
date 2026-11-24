import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useThemeStore } from '../../store';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';
import useEmployeeStore from '../../store/useEmployeeStore';
import { CreateTicketModal } from './components/CreateTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { TicketKanbanBoard } from './components/TicketKanbanBoard';

const DEFAULT_DEPARTMENTS = [
  'All Departments',
  'Admissions',
  'Accounts & Finance',
  'Academic & Faculty',
  'IT & Technical Support',
  'Human Resources',
  'Operations & Admin',
  'Student Services',
  'Examination',
  'Marketing & Outreach',
];

const STATUS_LIST = ['All Statuses', 'Open', 'In Progress', 'Under Review', 'Pending', 'Resolved', 'Closed'];
const PRIORITY_LIST = ['All Priorities', 'Low', 'Medium', 'High', 'Urgent'];

const PRIORITY_BADGES = {
  Low: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
  Medium: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
  High: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  Urgent: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800 animate-pulse font-bold',
};

const STATUS_BADGES = {
  Open: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
  'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
  'Under Review': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
  Closed: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

export const TicketManagement = () => {
  const { isDarkMode } = useThemeStore();
  const { user } = useAuth();
  const { departments: storeDepartments, fetchDepartments } = useEmployeeStore();
  const [searchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state (initial from URL search params if present)
  const initialDept = searchParams.get('department') || 'All Departments';
  const [selectedView, setSelectedView] = useState('all'); // 'all', 'assigned_to_me', 'my_department', 'created_by_me', 'unassigned'
  const [selectedDepartment, setSelectedDepartment] = useState(initialDept);
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showDeptAnalytics, setShowDeptAnalytics] = useState(false);

  const fetchTicketsData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        sortBy: 'createdAt',
        order: 'desc',
      };

      if (selectedView !== 'all') {
        params.view = selectedView;
      }
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        params.department = selectedDepartment;
      }
      if (selectedStatus && selectedStatus !== 'All Statuses') {
        params.status = selectedStatus;
      }
      if (selectedPriority && selectedPriority !== 'All Priorities') {
        params.priority = selectedPriority;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const [ticketsRes, statsRes] = await Promise.all([
        ticketService.getTickets(params),
        ticketService.getTicketStats(),
      ]);

      const ticketList =
        ticketsRes?.tickets || ticketsRes?.data?.tickets || ticketsRes?.data || [];
      setTickets(Array.isArray(ticketList) ? ticketList : []);

      const statsData = statsRes?.stats || statsRes?.data?.stats || null;
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching tickets or stats:', err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedView,
    selectedDepartment,
    selectedStatus,
    selectedPriority,
    searchQuery,
  ]);

  useEffect(() => {
    fetchDepartments?.();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchTicketsData();
  }, [fetchTicketsData]);

  const handleCreateSuccess = () => {
    fetchTicketsData();
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicketId(null);
    setEditingTicket(ticket);
    setCreateModalOpen(true);
  };

  const availableDepartments = Array.from(
    new Set([
      'All Departments',
      ...DEFAULT_DEPARTMENTS.filter((d) => d !== 'All Departments'),
      ...(storeDepartments?.map((d) => d.DeptName || d.name) || []),
    ])
  ).filter(Boolean);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎫</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Ticket & Task Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department-wise task routing, individual employee assignments, checklists, and SLA tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowDeptAnalytics(!showDeptAnalytics)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition flex items-center space-x-1.5 shadow-sm ${
              showDeptAnalytics
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>📊</span>
            <span>{showDeptAnalytics ? 'Hide Analytics' : 'Department Analytics'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTicket(null);
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-800 transition flex items-center space-x-1.5"
          >
            <span>+</span>
            <span>Create New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          className={`p-4 rounded-2xl border transition shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Tickets</span>
            <span>📑</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.total ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">All logged requests</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-sky-500 text-xs font-semibold mb-1">
            <span>Open & Pending</span>
            <span>⏳</span>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {stats?.open ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting pickup</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-500 text-xs font-semibold mb-1">
            <span>In Progress</span>
            <span>⚡</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats?.inProgress ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Being handled</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-rose-500 text-xs font-semibold mb-1">
            <span>Urgent & High</span>
            <span>🔥</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {(stats?.urgent || 0) + (stats?.highPriority || 0)}
          </div>
          <span className="text-[10px] text-rose-500 font-medium">{stats?.urgent || 0} urgent</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-amber-500 text-xs font-semibold mb-1">
            <span>Overdue SLA</span>
            <span>⏰</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.overdue ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Passed due date</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition shadow-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-500 text-xs font-semibold mb-1">
            <span>Resolved Rate</span>
            <span>✅</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.resolutionRate ?? 0}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {(stats?.resolved || 0) + (stats?.closed || 0)} resolved
          </span>
        </div>
      </div>

      {/* Department Analytics Collapsible Bar */}
      {showDeptAnalytics && stats?.departmentDistribution && (
        <div
          className={`p-5 rounded-2xl border transition shadow-sm space-y-4 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <span>🏢</span>
              <span>Department-Wise Ticket Load & Resolution</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {stats.departmentDistribution.length} departments active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats.departmentDistribution.map((dept) => {
              const resRate =
                dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
              return (
                <div
                  key={dept._id}
                  className={`p-3 rounded-xl border text-xs space-y-2 ${
                    isDarkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="truncate text-slate-800 dark:text-slate-100">{dept._id}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{dept.total} total</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{dept.open} Open</span>
                    <span>{dept.resolved} Resolved ({resRate}%)</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                      style={{ width: `${resRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`rounded-2xl border shadow-sm overflow-hidden transition ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
        }`}
      >
        {/* View Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Tickets' },
              { id: 'assigned_to_me', label: 'Assigned to Me' },
              { id: 'unassigned', label: 'Department Queue (Unassigned)' },
              { id: 'created_by_me', label: 'Created by Me' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                  selectedView === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mode Switcher: List vs Kanban */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center space-x-1 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>📋</span>
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center space-x-1 ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>📊</span>
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900">
          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {PRIORITY_LIST.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search ticket #, title, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>
          </div>
        </div>

        {/* Content Body: List vs Kanban */}
        <div className="p-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Loading tickets...</p>
            </div>
          ) : viewMode === 'kanban' ? (
            <TicketKanbanBoard
              tickets={tickets}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onTicketStatusChange={fetchTicketsData}
            />
          ) : tickets.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <span className="text-4xl">📭</span>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No tickets found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No tickets matching your filters or search terms. Try adjusting filters or create a new ticket.
              </p>
              <button
                onClick={() => {
                  setEditingTicket(null);
                  setCreateModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
              >
                + Create Ticket
              </button>
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Ticket #</th>
                    <th className="pb-3">Title & Category</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Assigned Employee</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Checklist</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {tickets.map((ticket) => {
                    const completedSubtasks =
                      ticket.subtasks?.filter((st) => st.isCompleted).length || 0;
                    const totalSubtasks = ticket.subtasks?.length || 0;
                    const isOverdue =
                      ticket.dueDate &&
                      new Date(ticket.dueDate) < new Date() &&
                      !['Resolved', 'Closed'].includes(ticket.status);

                    return (
                      <tr
                        key={ticket._id}
                        onClick={() => setSelectedTicketId(ticket._id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                      >
                        {/* Ticket Number */}
                        <td className="py-3 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {ticket.ticketNumber}
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 max-w-xs pr-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {ticket.title}
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                              {ticket.category || 'Task'}
                            </span>
                            {ticket.comments?.length > 0 && (
                              <span>💬 {ticket.comments.length}</span>
                            )}
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 whitespace-nowrap">
                          <span className="font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            🏢 {ticket.department}
                          </span>
                        </td>

                        {/* Assigned Employee */}
                        <td className="py-3 whitespace-nowrap">
                          {ticket.assignedTo ? (
                            <div className="flex items-center space-x-1.5">
                              <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px] font-bold">
                                {(ticket.assignedTo.name || ticket.assignedToName || 'E')[0]}
                              </div>
                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                {ticket.assignedTo.name || ticket.assignedToName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                              PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.Medium
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                              STATUS_BADGES[ticket.status] || STATUS_BADGES.Open
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>

                        {/* Checklist progress */}
                        <td className="py-3 whitespace-nowrap">
                          {totalSubtasks > 0 ? (
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[11px] font-medium ${
                                  completedSubtasks === totalSubtasks
                                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'text-slate-500'
                                }`}
                              >
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500"
                                  style={{
                                    width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`text-xs font-medium ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {ticket.dueDate
                              ? new Date(ticket.dueDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pr-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicketId(ticket._id);
                            }}
                            className="px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-semibold transition text-xs mr-1"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTicket(ticket);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={Boolean(selectedTicketId)}
          onClose={() => setSelectedTicketId(null)}
          onUpdate={fetchTicketsData}
          onEdit={(ticket) => handleEditTicket(ticket)}
        />
      )}

      {/* Create / Edit Ticket Modal */}
      {createModalOpen && (
        <CreateTicketModal
          isOpen={createModalOpen}
          initialTicket={editingTicket}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingTicket(null);
          }}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default TicketManagement;
