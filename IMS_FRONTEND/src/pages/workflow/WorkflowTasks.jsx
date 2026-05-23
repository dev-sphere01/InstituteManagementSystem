import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../services/API";
import { useNotification } from "../../services/NotificationService";

import { useAuth } from "../../context/AuthContext";
import StatusManagementPanel from "./StatusManagementPanel";
import DocumentVerificationPanel from "./DocumentVerificationPanel";
import * as XLSX from "xlsx";

const TAB_ROLE_MAP = {
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
      const statusToFetch = exportType === 'pending' ? 'not_completed' : 'all';
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
        ) : activeTab ? (
          <StatusManagementPanel
            activeTab={activeTab}
            courseOptions={courseOptions}
            batchOptions={batchOptions}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
             <p className="text-sm font-bold text-slate-500">Select a task category</p>
          </div>
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
