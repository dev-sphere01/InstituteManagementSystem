import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../services/API";
import { useNotification } from "../../services/NotificationService";

import { useAuth } from "../../context/AuthContext";
import DocumentVerificationPanel from "./DocumentVerificationPanel";
import StatusManagementPanel from "./StatusManagementPanel";
import * as XLSX from "xlsx";

const TAB_ROLE_MAP = {
  "Fee Collection": ["Accountant"],
  "Document Verification": ["Verifier"],
  "Registration": ["Admin"],
  "Exam Form": ["Admin"],
  "Admit Card": ["Admin"],
  "Certificate": ["Admin"]
};

const TABS = Object.keys(TAB_ROLE_MAP);

const WorkflowTasks = () => {
  const { user, hasRole, hasPermission } = useAuth();
  const { tabSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();
  
  const query = new URLSearchParams(location.search);
  const filterParam = query.get('filter');
  const slugToTab = (slug) => slug ? TABS.find(t => t.toLowerCase().replace(" ", "-") === slug) : null;
  const tabToSlug = (tab) => tab.toLowerCase().replace(" ", "-");
  
  const getVisibleTabs = () => {
    const isAdmin = hasRole('Admin') || hasPermission('*') || user?.role?.RoleName?.toLowerCase()?.includes('admin');
    if (isAdmin) return TABS;
    
    const userRole = user?.role?.RoleName || "";
    return TABS.filter(tab => TAB_ROLE_MAP[tab].some(r => r.toLowerCase() === userRole.toLowerCase()));
  };

  const visibleTabs = getVisibleTabs();
  const [activeTab, setActiveTab] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'pending', 'completed' or 'all'
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, taskId: null, studentName: '' });
  const [remarkModal, setRemarkModal] = useState({ isOpen: false, taskId: null, currentStatus: '', text: '' });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          API.get("/courses"),
          API.get("/batches")
        ]);
        if(cRes?.data) setCourseOptions(Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []);
        if(bRes?.data) setBatchOptions(Array.isArray(bRes.data) ? bRes.data : bRes.data.data || []);
      } catch (e) {
        console.error("Failed to load dropdowns", e);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const slugTab = slugToTab(tabSlug);
    if (slugTab && visibleTabs.includes(slugTab)) {
       setActiveTab(slugTab);
       setSearchQuery(""); // clear search on tab switch
       
       // Sync filter from URL if present
       if (filterParam && ['pending', 'completed', 'all'].includes(filterParam)) {
          setFilterStatus(filterParam);
       }
    } else if (visibleTabs.length > 0) {
       navigate(`/dashboard/workflow/tasks/${tabToSlug(visibleTabs[0])}`, { replace: true });
    }
  }, [tabSlug, visibleTabs.length, filterParam]);

  useEffect(() => {
    if (activeTab && activeTab !== 'Document Verification') {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [activeTab, filterStatus, filterCourse, filterBatch]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await API.get("/tasks", { 
        params: { 
           taskName: activeTab, 
           filterStatus,
           course: filterCourse,
           batch: filterBatch
        } 
      });
      if (response.success) {
        setTasks(response.data || []);
      }
    } catch (error) {
      notify(error.response?.data?.message || "Failed to fetch tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus, currentRemark = "") => {
    try {
      setUpdatingTaskId(taskId);
      const response = await API.patch(`/tasks/${taskId}`, {
        status: newStatus,
        remarkText: currentRemark
      });
      if (response.success) {
        notify(`Status updated to ${newStatus}`, "success");
        fetchTasks();
      }
    } catch (error) {
       notify(error.response?.data?.message || "Not authorized or failed update", "error");
    } finally {
       setUpdatingTaskId(null);
    }
  };

  const handleMarkAsDoneClick = (taskId, studentName) => {
    setConfirmModal({ isOpen: true, taskId, studentName });
  };

  const handleAddRemarkClick = (taskId, currentStatus) => {
    setRemarkModal({ isOpen: true, taskId, currentStatus, text: '' });
  };

  const confirmMarkAsDone = async () => {
    const { taskId } = confirmModal;
    setConfirmModal({ isOpen: false, taskId: null, studentName: '' });
    
    try {
      setUpdatingTaskId(taskId);
      const response = await API.post(`/tasks/${taskId}/done`);
      if (response.success) {
        notify(`Task marked as completed`, "success");
        fetchTasks();
      }
    } catch (error) {
       notify(error.response?.data?.message || "Not authorized or failed check", "error");
    } finally {
       setUpdatingTaskId(null);
    }
  };

  const handleExportExcel = async (exportType) => {
    try {
      setLoading(true);
      const statusToFetch = exportType === 'pending' ? 'pending' : 'all';
      const response = await API.get("/tasks", { 
        params: { 
          taskName: activeTab, 
          filterStatus: statusToFetch,
          course: filterCourse,
          batch: filterBatch
        } 
      });
      
      const dataToExport = response.data || [];
      if (dataToExport.length === 0) {
        notify(`No ${exportType} records to export`, "info");
        return;
      }
      
      const worksheetData = dataToExport.map(t => ({
        "Form No": t.studentId?.formNo || "N/A",
        "Reg No": t.studentId?.generatedRegNo || "N/A",
        "Student Name": t.studentId?.fullName || "Unregistered",
        "Course": t.studentId?.courseApplied || "N/A",
        "Batch (Month)": t.studentId?.month || "N/A",
        "Contact": t.studentId?.contactNumber || "N/A",
        "Email": t.studentId?.emailAddress || "N/A",
        "Task Status": t.status.toUpperCase()
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab.substring(0, 31));
      
      XLSX.writeFile(workbook, `${activeTab.replace(' ', '_')}_Report_${exportType}_${new Date().toLocaleDateString()}.xlsx`);
    } catch (err) {
      console.error(err);
      notify("Failed to export Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitRemark = () => {
    const { taskId, currentStatus, text } = remarkModal;
    if (text.trim()) {
       updateStatus(taskId, currentStatus, text);
    }
    setRemarkModal({ isOpen: false, taskId: null, currentStatus: '', text: '' });
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    return name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  };

  const formattedTasks = tasks.filter(task => {
    const term = searchQuery.toLowerCase();
    const nameMatch = task.studentId?.fullName?.toLowerCase().includes(term);
    const formMatch = task.studentId?.formNo?.toLowerCase().includes(term);
    return nameMatch || formMatch;
  });

  const getStatusBadge = (status) => {
    const isCompleted = status === 'completed';
    const isInProgress = status === 'in_progress';
    return (
      <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full shadow-sm border backdrop-blur-sm ${
        isCompleted ? 'bg-green-100/80 text-green-700 border-green-200' :
        isInProgress ? 'bg-amber-100/80 text-amber-700 border-amber-200' :
        'bg-slate-100/80 text-slate-700 border-slate-200'
      }`}>
        <span className={`w-1 h-1 rounded-full mr-1.5 self-center ${
           isCompleted ? 'bg-green-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-500'
        }`}></span>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="relative p-2 md:p-4 min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col font-sans overflow-hidden transition-colors duration-300">
      {/* Background Blobs for Glassmorphism Context */}
      <div className="fixed top-0 right-0 w-[30rem] h-[30rem] -mt-20 -mr-20 rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-400/20 blur-[80px] opacity-70 pointer-events-none z-0 dark:opacity-20 transition-all"></div>
      <div className="fixed bottom-0 left-0 w-[20rem] h-[20rem] -mb-32 -ml-32 rounded-full bg-gradient-to-tr from-emerald-300/20 to-teal-400/20 blur-[80px] opacity-70 pointer-events-none z-0 dark:opacity-10 transition-all"></div>

      <div className="relative z-10 max-w-full mx-auto w-full">
        {activeTab === 'Document Verification' ? (
          <DocumentVerificationPanel />
        ) : activeTab === 'Exam Form' || activeTab === 'Admit Card' || activeTab === 'Certificate' ? (
          <StatusManagementPanel
            activeTab={activeTab}
            courseOptions={courseOptions}
            batchOptions={batchOptions}
          />
        ) : (
          <>
            {/* Header Block & Controls with Glassmorphism */}
            <div className="mb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl p-3 rounded-lg shadow-sm border border-white/80 dark:border-gray-700/50">
              <div className="max-w-md">
                <div className="flex items-center gap-2 mb-0.5">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                   </div>
                   <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                     {activeTab || "Workflow"}
                   </h1>
                   {activeTab === 'Fee Collection' && (
                     <span className="animate-pulse px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded text-[9px] shadow-sm ml-2 tracking-wide">PRIORITY</span>
                   )}
                </div>
                 <p className="text-slate-500 dark:text-gray-400 text-[11px] font-medium mt-0.5">Monitor structural lifecycle stages.</p>
              </div>
              
              <div className="flex flex-col flex-wrap lg:flex-nowrap items-stretch lg:items-center gap-3 w-full">
                {/* Search Bar + Filters */}
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto overflow-hidden">
                  <div className="relative w-full sm:w-48 shrink-0 group">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Form No or Name..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white/90 dark:bg-gray-800/90 border border-slate-200 dark:border-gray-700 rounded-md text-[11px] font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all text-slate-700 dark:text-gray-200 backdrop-blur-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-500/50"
                    />
                    <svg className="w-3 h-3 text-slate-400 dark:text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  
                  {activeTab && (
                    <select 
                        value={filterCourse} 
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="w-full sm:w-36 shrink-0 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm text-slate-700"
                    >
                        <option value="">All Courses</option>
                        {courseOptions.map((c, i) => (
                        <option key={i} value={c.courseName || c.course}>{c.courseName || c.course}</option>
                        ))}
                    </select>
                  )}

                  {activeTab && (
                    <select 
                        value={filterBatch} 
                        onChange={(e) => setFilterBatch(e.target.value)}
                        className="w-full sm:w-36 shrink-0 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm text-slate-700"
                    >
                        <option value="">All Batches</option>
                        {/* Fallback to standard months if batches are empty */}
                        {batchOptions.length > 0 ? batchOptions.map((b, i) => (
                          <option key={i} value={b.batchTiming || b.batchName || b.month}>{b.batchTiming || b.batchName || b.month}</option>
                        )) : (
                          ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))
                        )}
                    </select>
                  )}
                </div>

                {/* Filter Toggle */}
                {activeTab && (
                  <div className="flex bg-slate-100/80 dark:bg-gray-900/50 p-1 rounded-md border border-slate-200/50 dark:border-gray-700/50 shadow-inner w-full sm:w-auto shrink-0 relative">
                     <button
                       onClick={() => setFilterStatus('pending')}
                       className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10px] font-black transition-all duration-300 ease-out flex justify-center items-center gap-1 z-10 uppercase tracking-wide ${
                         filterStatus === 'pending' 
                         ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-slate-200/50 dark:shadow-none' 
                         : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-200/50 dark:hover:bg-gray-800/50'
                       }`}
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       Active
                     </button>
                     <button
                       onClick={() => setFilterStatus('completed')}
                       className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10px] font-black transition-all duration-300 ease-out flex justify-center items-center gap-1 z-10 uppercase tracking-wide ${
                         filterStatus === 'completed' 
                         ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-slate-200/50 dark:shadow-none' 
                         : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-200/50 dark:hover:bg-gray-800/50'
                       }`}
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       History
                     </button>
                     <button
                       onClick={() => setFilterStatus('all')}
                       className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10px] font-black transition-all duration-300 ease-out flex justify-center items-center gap-1 z-10 uppercase tracking-wide ${
                         filterStatus === 'all' 
                         ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm shadow-slate-200/50 dark:shadow-none' 
                         : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-200/50 dark:hover:bg-gray-800/50'
                       }`}
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 17v-2a4 4 0 00-4-4H5m11 2a4 4 0 01-4 4H12m0 0l-3-3m3 3l3-3"></path></svg>
                       Report (All)
                     </button>
                  </div>
                )}
                
                {activeTab && (
                  <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <button 
                      onClick={() => handleExportExcel('pending')}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-md hover:bg-emerald-700 transition-all flex justify-center items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Pending Excel
                    </button>
                    <button 
                      onClick={() => handleExportExcel('all')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-md hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      All Excel
                    </button>
                  </div>
                )}
              </div>
            </div>

        {/* Content Table Card (Responsive) */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-lg shadow-sm border border-white/60 dark:border-gray-700/50 overflow-hidden flex-1 relative z-10 transition-all duration-300">
          {!activeTab ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
               <p className="text-sm font-bold text-slate-500">Select a task category</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
               <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-100 border-t-indigo-600"></div>
               <p className="text-slate-400 font-semibold text-xs">Syncing datasets...</p>
            </div>
          ) : formattedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 h-64 text-slate-400 text-center">
              <svg className="w-10 h-10 text-slate-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              <h3 className="text-sm font-bold text-slate-600">No Match</h3>
              <p className="text-slate-400 mt-1 text-xs">No {filterStatus} records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100/60 dark:divide-gray-700/50 text-[11px]">
                 <thead className="bg-slate-50/50 dark:bg-gray-800/40 backdrop-blur-sm">
                   <tr>
                     <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">Applicant</th>
                     <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Reg Details</th>
                     <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">Status</th>
                     <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap hidden lg:table-cell">Remarks</th>
                     <th className="px-3 py-2 text-right text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50/50 dark:divide-gray-700/30">
                   {formattedTasks.map(task => (
                     <tr key={task._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all duration-200 group">
                       
                       {/* Student Col (Responsive) */}
                       <td className="px-3 py-1.5 min-w-[200px]">
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-200/50 dark:border-indigo-700/50 flex items-center justify-center shrink-0 font-bold text-[10px] text-indigo-700 dark:text-indigo-300 shadow-sm">
                               {getInitials(task.studentId?.fullName)}
                            </div>
                            <div className="flex-1 min-w-0">
                               <button 
                                 onClick={() => navigate(`/dashboard/student-details/${task.studentId?._id}`)}
                                 className="text-[11px] font-bold text-slate-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline leading-tight truncate text-left w-full transition-colors"
                               >
                                 {task.studentId?.fullName || "Unregistered"}
                               </button>
                               <div className="text-[9px] font-semibold text-slate-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1">
                                  #{task.studentId?.formNo || "N/A"}
                               </div>
                               {/* Mobile Only Extras */}
                               <div className="sm:hidden mt-2 flex flex-col gap-1.5">
                                 {getStatusBadge(task.status)}
                                 <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                                    {task.studentId?.courseApplied || "Standard Course"}
                                 </span>
                               </div>
                            </div>
                         </div>
                       </td>

                       {/* Course Col (Hidden on Mobile) */}
                       <td className="px-3 py-1.5 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/40 rounded px-1.5 py-0.5 flex items-center w-fit border border-indigo-100 dark:border-indigo-800/50 shadow-sm backdrop-blur-sm">
                             {task.studentId?.courseApplied || "Standard"}
                          </div>
                       </td>

                       {/* Status Col (Hidden on small) */}
                       <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                         {getStatusBadge(task.status)}
                       </td>

                       {/* Remarks Col (Hidden on medium/small) */}
                       <td className="px-3 py-1.5 hidden lg:table-cell w-48">
                         <div className="text-[10px] text-slate-600 dark:text-gray-300 bg-slate-50/50 dark:bg-gray-800/50 border border-slate-200/60 dark:border-gray-700/60 rounded px-2 py-1 max-w-full shadow-sm">
                           {task.remarks && task.remarks.length > 0 ? (
                             <div className="truncate w-full line-clamp-1 white-space-normal" title={task.remarks[task.remarks.length - 1].text}>
                                <span className="font-bold uppercase text-[8px] text-slate-400 dark:text-gray-500 mr-1">{task.remarks[task.remarks.length - 1].by}:</span> 
                                {task.remarks[task.remarks.length - 1].text}
                             </div>
                           ) : <span className="text-slate-400 dark:text-gray-500 italic text-[9px]">No recent logs</span>}
                         </div>
                       </td>

                       {/* Actions Col */}
                       <td className="px-3 py-1.5 whitespace-nowrap text-right align-middle">
                          {task.status !== 'completed' ? (
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                               
                               <button
                                 onClick={() => handleAddRemarkClick(task._id, task.status)}
                                 className="text-slate-400 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-600 w-6 h-6 flex items-center justify-center rounded-md transition-all shadow-sm outline-none hover:shadow"
                                 title="Add Remark"
                               >
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                               </button>

                               {/* Compact Status Select */}
                               <select 
                                 className="text-[9px] font-black border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded shadow-sm focus:ring-1 focus:ring-indigo-500 py-1 px-1.5 outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-gray-800"
                                 onChange={(e) => updateStatus(task._id, e.target.value)}
                                 value={task.status}
                                 disabled={updatingTaskId === task._id}
                               >
                                 <option value="pending">PENDING</option>
                                 <option value="in_progress">IN PROGRESS</option>
                                 <option value="escalated">ESCALATED</option>
                               </select>

                               <button
                                 onClick={() => handleMarkAsDoneClick(task._id, task.studentId?.fullName)}
                                 disabled={updatingTaskId === task._id}
                                 className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm shadow-emerald-500/20 px-2 py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1 active:scale-95"
                               >
                                 {updatingTaskId === task._id ? (
                                     <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                                 ) : (
                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                 )}
                                 Done
                               </button>
                            </div>
                          ) : (
                            <span className="inline-flex text-emerald-600 dark:text-emerald-400 font-black text-[9px] items-center bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 rounded justify-end shadow-sm backdrop-blur-sm">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                              DONE
                            </span>
                          )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Modern Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden scale-in-center">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Confirm Approval</h3>
              <p className="text-xs text-slate-500 font-medium">
                You are about to approve <span className="font-bold text-slate-700">{confirmModal.studentName || 'this student'}</span>. They will immediately progress to the next pipeline stage. Proceed?
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, taskId: null, studentName: '' })}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200/60 transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmMarkAsDone}
                className="px-5 py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all shadow-emerald-500/20 uppercase tracking-widest"
              >
                YES, APPROVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Custom Add Remark Modal */}
      {remarkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden scale-in-center">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                 </div>
                 <h3 className="text-lg font-black text-slate-800">Add Remark Log</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Attach an internal note to this workflow step. This will be permanently logged.
              </p>
              
              <textarea 
                autoFocus
                value={remarkModal.text}
                onChange={(e) => setRemarkModal(prev => ({...prev, text: e.target.value}))}
                placeholder="Type your remark here..."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all"
              />
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
              <button 
                onClick={() => setRemarkModal({ isOpen: false, taskId: null, currentStatus: '', text: '' })}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200/60 transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={submitRemark}
                disabled={!remarkModal.text.trim()}
                className="px-5 py-2 rounded-lg text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50 disabled:bg-slate-400 uppercase tracking-widest"
              >
                SAVE REMARK
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scale-in-center {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scale-in-center { animation: scale-in-center 0.25s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
      `}</style>
    </div>
  );
};

export default WorkflowTasks;
