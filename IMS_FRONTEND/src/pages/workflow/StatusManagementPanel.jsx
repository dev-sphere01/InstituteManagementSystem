import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/API";
import { useNotification } from "../../services/NotificationService";
import * as XLSX from "xlsx";

// ─── Tab Config ─────────────────────────────────────────────────────────────
const TAB_CONFIG = {
  "Document Verification": {
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: "Verify submitted student documents.",
    statuses: ["pending", "in_progress", "escalated", "completed"],
  },
  "Registration": {
    color: "pink",
    gradient: "from-pink-500 to-rose-600",
    lightBg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-800",
    text: "text-pink-700 dark:text-pink-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    description: "Manage student registration procedures.",
    statuses: ["pending", "in_progress", "escalated", "completed"],
  },
  "Exam Form": {
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: "Manage exam form submission status for each student.",
    statuses: ["pending", "in_progress", "submitted", "completed"],
  },
  "Admit Card": {
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
      </svg>
    ),
    description: "Track admit card generation and issuance status.",
    statuses: ["pending", "in_progress", "issued", "completed"],
  },
  "Certificate": {
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    description: "Manage certificate generation and dispatch status.",
    statuses: ["pending", "in_progress", "dispatched", "completed"],
  },
};

// ─── Status Badge Config ─────────────────────────────────────────────────────
const STATUS_BADGE = {
  pending: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400", label: "Pending" },
  in_progress: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500 animate-pulse", label: "In Progress" },
  submitted: { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500", label: "Submitted" },
  issued: { bg: "bg-cyan-50 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500", label: "Issued" },
  dispatched: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500", label: "Dispatched" },
  completed: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", label: "Completed" },
  escalated: { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500", label: "Escalated" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const getInitials = (name) => {
  if (!name) return "ST";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ task, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full overflow-hidden animate-scale-in">
      <div className="p-6">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">Confirm Completion</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Mark <span className="font-bold text-slate-700 dark:text-slate-200">{task?.studentId?.fullName || "this student"}</span> as <strong>Completed</strong> for this stage? This action will advance them in the workflow.
        </p>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors">
          CANCEL
        </button>
        <button onClick={onConfirm} className="px-5 py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all uppercase tracking-widest">
          YES, COMPLETE
        </button>
      </div>
    </div>
  </div>
);

// ─── Remark Modal ─────────────────────────────────────────────────────────────
const RemarkModal = ({ value, onChange, onSave, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full overflow-hidden animate-scale-in">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Add Remark</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Attach an internal note to this stage. This will be permanently logged.</p>
        <textarea
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your remark here..."
          className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none resize-none transition-all text-slate-700 dark:text-slate-200"
        />
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors">
          CANCEL
        </button>
        <button onClick={onSave} disabled={!value.trim()} className="px-5 py-2 rounded-lg text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50 disabled:bg-slate-400 uppercase tracking-widest">
          SAVE REMARK
        </button>
      </div>
    </div>
  </div>
);

// ─── Student Status Card ──────────────────────────────────────────────────────
const StudentCard = ({ task, tabCfg, onStatusChange, onComplete, onRemark, busy }) => {
  const navigate = useNavigate();
  const student = task.studentId || {};
  const lastRemark = task.remarks?.length ? task.remarks[task.remarks.length - 1] : null;
  const isDone = task.status === "completed";

  return (
    <div className={`relative bg-white dark:bg-slate-900 border ${isDone ? "border-emerald-200 dark:border-emerald-800/50" : "border-slate-200/70 dark:border-slate-800"} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group`}>
      {/* Status stripe */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isDone ? "bg-emerald-500" : task.status === "in_progress" ? "bg-blue-500" : task.status === "escalated" ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-700"}`} />

      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${tabCfg.gradient} flex items-center justify-center text-white font-black text-sm shadow-md`}>
              {getInitials(student.fullName)}
            </div>
            <div className="min-w-0">
              <button
                onClick={() => navigate(`/dashboard/student-details/${student._id}`)}
                className="text-sm font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block max-w-[180px] text-left leading-tight"
              >
                {student.fullName || "Unknown"}
              </button>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] font-semibold text-slate-400">#{student.formNo || "N/A"}</span>
                {student.generatedRegNo && (
                  <span className="text-[10px] font-semibold text-indigo-400">Reg: {student.generatedRegNo}</span>
                )}
              </div>
            </div>
          </div>
          <StatusBadge status={task.status} />
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {student.courseApplied && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tabCfg.lightBg} ${tabCfg.text} ${tabCfg.border} border`}>
              {student.courseApplied}
            </span>
          )}
          {student.month && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {student.month}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${new Date(task.dueDate) < new Date() && !isDone ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"} border`}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Last remark */}
        {lastRemark && (
          <div className="mb-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700/50">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mr-1">{lastRemark.by}:</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 italic">{lastRemark.text}</span>
          </div>
        )}

        {/* Actions */}
        {!isDone ? (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={task.status}
              onChange={e => onStatusChange(task._id, e.target.value)}
              disabled={busy === task._id}
              className="flex-1 min-w-[110px] text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-lg py-1.5 px-2 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-sm transition-all"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
            </select>

            <button
              onClick={() => onRemark(task._id)}
              disabled={busy === task._id}
              title="Add Remark"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>

            <button
              onClick={() => onComplete(task)}
              disabled={busy === task._id}
              className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${tabCfg.gradient} text-white rounded-lg text-[10px] font-black shadow-sm transition-all hover:opacity-90 disabled:opacity-50 uppercase tracking-wide active:scale-95`}
            >
              {busy === task._id ? (
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              COMPLETED
            </span>
            <button
              onClick={() => onRemark(task._id)}
              title="Add Note"
              className="text-[9px] text-slate-400 hover:text-indigo-500 transition-colors font-semibold"
            >
              + Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
const StatusManagementPanel = ({ activeTab, courseOptions = [], batchOptions = [] }) => {
  const notify = useNotification();
  const tabCfg = TAB_CONFIG[activeTab] || TAB_CONFIG["Exam Form"];

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid | table

  const [confirmModal, setConfirmModal] = useState({ open: false, task: null });
  const [remarkModal, setRemarkModal] = useState({ open: false, taskId: null, text: "" });

  const fetchTasks = useCallback(async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      const res = await API.get("/tasks", {
        params: { taskName: activeTab, filterStatus, course: filterCourse, batch: filterBatch }
      });
      if (res.success) setTasks(res.data || []);
    } catch (e) {
      notify(e.response?.data?.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterStatus, filterCourse, filterBatch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateStatus = async (taskId, newStatus, remarkText = "") => {
    setBusy(taskId);
    try {
      const res = await API.patch(`/tasks/${taskId}`, { status: newStatus, remarkText });
      if (res.success) { notify(`Status updated to ${newStatus}`, "success"); fetchTasks(); }
    } catch (e) {
      notify(e.response?.data?.message || "Update failed", "error");
    } finally { setBusy(null); }
  };

  const markDone = async (taskId) => {
    setBusy(taskId);
    try {
      const res = await API.post(`/tasks/${taskId}/done`);
      if (res.success) { notify("Task completed!", "success"); fetchTasks(); }
    } catch (e) {
      notify(e.response?.data?.message || "Failed to complete task", "error");
    } finally { setBusy(null); }
  };

  const saveRemark = async () => {
    const { taskId, text } = remarkModal;
    if (!text.trim()) return;
    const task = tasks.find(t => t._id === taskId);
    await updateStatus(taskId, task?.status || "pending", text);
    setRemarkModal({ open: false, taskId: null, text: "" });
  };

  const handleExportExcel = (exportType) => {
    try {
      let dataToExport = tasks;
      
      // Filter by search query just like the view
      dataToExport = dataToExport.filter(t => {
        const term = searchQuery.toLowerCase();
        return !term || t.studentId?.fullName?.toLowerCase().includes(term) || t.studentId?.formNo?.toLowerCase().includes(term);
      });

      if (exportType === 'not_completed') {
        dataToExport = dataToExport.filter(t => t.status !== 'completed');
      } else if (exportType !== 'all') {
        dataToExport = dataToExport.filter(t => t.status === exportType);
      }
      
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
    }
  };

  const filtered = tasks.filter(t => {
    const term = searchQuery.toLowerCase();
    const nameOk = !term || t.studentId?.fullName?.toLowerCase().includes(term) || t.studentId?.formNo?.toLowerCase().includes(term);
    return nameOk;
  });

  // Stats
  const stats = {
    total: filtered.length,
    pending: filtered.filter(t => t.status !== "completed").length,
    inProgress: filtered.filter(t => t.status === "in_progress").length,
    completed: filtered.filter(t => t.status === "completed").length,
  };

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/60 dark:border-slate-800 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tabCfg.gradient} flex items-center justify-center text-white shadow-lg`}>
              {tabCfg.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{activeTab}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{tabCfg.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name or form..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium focus:ring-2 focus:ring-indigo-400 outline-none text-slate-700 dark:text-slate-200 transition-all"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Course filter */}
            <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 dark:text-slate-200 shadow-sm">
              <option value="">All Courses</option>
              {courseOptions.map((c, i) => <option key={i} value={c.courseName || c.course}>{c.courseName || c.course}</option>)}
            </select>

            {/* Batch filter */}
            <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 dark:text-slate-200 shadow-sm">
              <option value="">All Batches</option>
              {(batchOptions.length > 0 ? batchOptions.map(b => b.batchTiming || b.batchName || b.month) : MONTHS).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Status toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
              {[["all", "All"], ["pending", "Active"], ["completed", "Done"]].map(([val, label]) => (
                <button key={val} onClick={() => setFilterStatus(val)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${filterStatus === val ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" /></svg>
              </button>
              <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "from-slate-400 to-slate-500", bg: "bg-slate-50 dark:bg-slate-900", border: "border-slate-200 dark:border-slate-800", type: "all" },
          { label: "Pending", value: stats.pending, color: "from-orange-400 to-amber-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", type: "not_completed" },
          { label: "In Progress", value: stats.inProgress, color: "from-blue-400 to-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", type: "in_progress" },
          { label: "Completed", value: stats.completed, color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", type: "completed" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-black text-sm shadow-sm`}>{s.value}</div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.label}</span>
            </div>
            <button 
              onClick={() => handleExportExcel(s.type)}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
              title={`Download ${s.label} Excel`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-100 border-t-indigo-600" />
          <p className="text-slate-400 text-xs font-semibold">Loading students...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">No Students Found</h3>
          <p className="text-xs text-slate-400 mt-1">No {filterStatus !== "all" ? filterStatus : ""} records match your filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(task => (
            <StudentCard
              key={task._id}
              task={task}
              tabCfg={tabCfg}
              busy={busy}
              onStatusChange={(id, status) => updateStatus(id, status)}
              onComplete={(task) => setConfirmModal({ open: true, task })}
              onRemark={(id) => setRemarkModal({ open: true, taskId: id, text: "" })}
            />
          ))}
        </div>
      ) : (
        // Table view
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/60 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                <tr className="text-left text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5 hidden sm:table-cell">Course</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Batch</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 hidden lg:table-cell">Last Remark</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(task => {
                  const s = task.studentId || {};
                  const lastRemark = task.remarks?.length ? task.remarks[task.remarks.length - 1] : null;
                  const isDone = task.status === "completed";
                  return (
                    <tr key={task._id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br ${tabCfg.gradient} flex items-center justify-center text-white font-black text-[9px]`}>
                            {getInitials(s.fullName)}
                          </div>
                          <div>
                            <button onClick={() => { }} className="font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left leading-tight">
                              {s.fullName || "Unknown"}
                            </button>
                            <div className="text-[9px] text-slate-400">#{s.formNo || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tabCfg.lightBg} ${tabCfg.text}`}>{s.courseApplied || "—"}</span>
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell text-slate-500 dark:text-slate-400 font-medium">{s.month || "—"}</td>
                      <td className="px-4 py-2"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-2 hidden lg:table-cell max-w-[180px]">
                        {lastRemark ? (
                          <span className="text-[10px] text-slate-500 italic truncate block" title={lastRemark.text}>{lastRemark.text}</span>
                        ) : <span className="text-[9px] text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {!isDone ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)} disabled={busy === task._id}
                              className="text-[9px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md py-1 px-1.5 outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer shadow-sm">
                              <option value="pending">PENDING</option>
                              <option value="in_progress">IN PROGRESS</option>
                              <option value="escalated">ESCALATED</option>
                            </select>
                            <button onClick={() => setRemarkModal({ open: true, taskId: task._id, text: "" })} title="Remark"
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 transition-all">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            </button>
                            <button onClick={() => setConfirmModal({ open: true, task })} disabled={busy === task._id}
                              className={`flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${tabCfg.gradient} text-white rounded-md text-[9px] font-black shadow-sm transition-all disabled:opacity-50 active:scale-95`}>
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                              Done
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 rounded-full text-[9px] font-black">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            DONE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {confirmModal.open && (
        <ConfirmModal
          task={confirmModal.task}
          onConfirm={async () => { await markDone(confirmModal.task._id); setConfirmModal({ open: false, task: null }); }}
          onCancel={() => setConfirmModal({ open: false, task: null })}
        />
      )}
      {remarkModal.open && (
        <RemarkModal
          value={remarkModal.text}
          onChange={text => setRemarkModal(p => ({ ...p, text }))}
          onSave={saveRemark}
          onCancel={() => setRemarkModal({ open: false, taskId: null, text: "" })}
        />
      )}

      <style>{`
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.25,0.46,0.45,0.94) both; }
      `}</style>
    </div>
  );
};

export default StatusManagementPanel;
