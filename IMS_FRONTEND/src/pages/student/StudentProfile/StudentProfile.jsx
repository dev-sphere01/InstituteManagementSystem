import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import studentService from "../../../services/studentService";
import workflowService from "../../../services/workflowService";
import { PermissionButton, usePermissions } from "../../../components/PermissionGuard";
import API from "../../../services/API";
import { useNotification } from "../../../services/NotificationService";
import getBaseFileURL from "../../../utils/getBaseFileURL";
import EditFeeModal from "./components/EditFeeModal";
import ChangeStatusModal from "./components/ChangeStatusModal";
import ChangeBatchModal from "./components/ChangeBatchModal";
import StudentHistorySection from "./components/StudentHistorySection";

const getFileUrl = (pathStr) => {
  if (!pathStr) return '';
  if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('data:')) {
    return pathStr;
  }
  const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr;
  return `${getBaseFileURL()}/${cleanPath}`;
};

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800",
  overdue: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800",
  escalated: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800",
};

const stepOrder = ['Fee Collection', 'Document Verification', 'Registration', 'Exam Form', 'Admit Card', 'Certificate'];

const StudentProfile = () => {
  const { id } = useParams();
  const { user, hasPermission } = usePermissions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [documentFields, setDocumentFields] = useState([]);

  const notify = useNotification();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState("Basic Info");
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [citiesOfSelectedState, setCitiesOfSelectedState] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // New Modals for Section C & E
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const loadCourses = async () => {
    try {
      const res = await API.get('/courses?limit=1000');
      if (res && res.success) {
        setCourses(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const loadStates = async () => {
    try {
      const res = await API.get('/country-state-city');
      let countryData = res?.data || res;
      if (Array.isArray(countryData)) {
        const indiaData = countryData.find(c => c.countryName === 'India' || c.name === 'India') || countryData[0];
        if (indiaData?.states) {
          const normalized = indiaData.states.map(s => ({
            name: s.stateName || s.name,
            cities: (s.cityNames || s.cities || []).map(c => c.name || c)
          }));
          setStatesData(normalized);
        }
      } else if (countryData?.states) {
        const normalized = countryData.states.map(s => ({
          name: s.stateName || s.name,
          cities: (s.cityNames || s.cities || []).map(c => c.name || c)
        }));
        setStatesData(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch states and cities", error);
    }
  };

  useEffect(() => {
    if (editForm.state && statesData.length > 0) {
      const matched = statesData.find(s => s.name.toLowerCase() === editForm.state.toLowerCase());
      setCitiesOfSelectedState(matched ? matched.cities : []);
    } else {
      setCitiesOfSelectedState([]);
    }
  }, [editForm.state, statesData]);

  const handleOpenEditModal = () => {
    const formattedDob = admission?.dob ? admission.dob.substring(0, 10) : "";
    const subjectsStr = Array.isArray(admission?.subjectsStudied)
      ? admission.subjectsStudied.join(", ")
      : admission?.subjectsStudied || "";

    setEditForm({
      ...admission,
      dob: formattedDob,
      subjectsStudied: subjectsStr,
    });
    setEditErrors({});
    setActiveEditTab("Basic Info");
    setIsEditModalOpen(true);
    
    if (courses.length === 0) loadCourses();
    if (statesData.length === 0) loadStates();
  };

  const validateForm = () => {
    const errs = {};
    if (!editForm.fullName?.trim()) errs.fullName = "Required";
    if (!editForm.dob) errs.dob = "Required";
    if (!editForm.gender) errs.gender = "Required";
    if (!editForm.category) errs.category = "Required";
    if (!editForm.aadharNo?.trim()) errs.aadharNo = "Required";
    if (!editForm.religion) errs.religion = "Required";

    if (!editForm.contactNumber?.trim()) errs.contactNumber = "Required";
    else if (!/^\d{10}$/.test(editForm.contactNumber.trim())) errs.contactNumber = "Must be a 10-digit number";

    if (editForm.alternateContactNumber?.trim() && !/^\d{10}$/.test(editForm.alternateContactNumber.trim())) {
      errs.alternateContactNumber = "Must be a 10-digit number";
    }
    if (editForm.guardianContactNumber?.trim() && !/^\d{10}$/.test(editForm.guardianContactNumber.trim())) {
      errs.guardianContactNumber = "Must be a 10-digit number";
    }

    if (editForm.emailAddress?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.emailAddress.trim())) {
      errs.emailAddress = "Invalid email format";
    }

    if (!editForm.address?.trim()) errs.address = "Required";
    if (!editForm.state) errs.state = "Required";
    if (!editForm.district) errs.district = "Required";
    
    if (!editForm.pinCode?.trim()) errs.pinCode = "Required";
    else if (!/^\d{6}$/.test(editForm.pinCode.trim())) errs.pinCode = "Must be 6 digits";

    if (!editForm.fathersName?.trim()) errs.fathersName = "Required";
    if (!editForm.mothersName?.trim()) errs.mothersName = "Required";

    if (!editForm.highestEducationalQualification) errs.highestEducationalQualification = "Required";
    if (!editForm.boardOrUniversity) errs.boardOrUniversity = "Required";
    if (!editForm.yearOfPassing) errs.yearOfPassing = "Required";
    if (!editForm.courseApplied) errs.courseApplied = "Required";
    if (!editForm.preferredModeOfLearning) errs.preferredModeOfLearning = "Required";

    return errs;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      notify("Please fill all required fields correctly.", "error");
      return;
    }

    setSavingProfile(true);
    try {
      const subjectsArray = typeof editForm.subjectsStudied === "string"
        ? editForm.subjectsStudied.split(",").map(s => s.trim()).filter(Boolean)
        : Array.isArray(editForm.subjectsStudied) ? editForm.subjectsStudied : [];

      const payload = {
        ...editForm,
        subjectsStudied: subjectsArray,
      };

      const res = await studentService.update(id, payload);
      if (res.success || res._id) {
        notify("Student profile updated successfully.", "success");
        setIsEditModalOpen(false);
        loadData();
      } else {
        notify(res.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Error updating student profile:", err);
      notify(err.response?.data?.message || "Failed to update student profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await studentService.getById(id);
      setData(res?.data || res);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await API.get('/document-master');
        if (res.success && res.data?.length > 0) {
          const activeDocs = res.data.filter(d => d.isActive).map(d => ({ key: d.key, label: d.label, isRequired: d.isRequired }));
          setDocumentFields(activeDocs);
        } else {
          setDocumentFields([
            { key: "candidatePhoto", label: "Candidate Photo", isRequired: true },
            { key: "candidateSignature", label: "Signature" },
            { key: "aadharPhoto", label: "Aadhar Card", isRequired: true },
            { key: "tenthMarksheet", label: "10th Marksheet" }
          ]);
        }
      } catch {
        setDocumentFields([
          { key: "candidatePhoto", label: "Candidate Photo", isRequired: true },
          { key: "aadharPhoto", label: "Aadhar Card", isRequired: true }
        ]);
      }
    };
    fetchMaster();
  }, []);

  useEffect(() => { loadData(); }, [id]);

  const tasks = useMemo(() => data?.data?.tasks || data?.tasks || [], [data]);
  const fee = data?.data?.fee || data?.fee || {};
  const feeSummary = fee?.summary || {};
  const warnings = data?.data?.warnings || data?.warnings || [];
  const admission = data?.data?.admission || data?.admission;

  const stepper = useMemo(() => {
    const map = tasks.reduce((acc, task) => { acc[task.taskName] = task; return acc; }, {});
    return stepOrder.map((key) => map[key]).filter(Boolean);
  }, [tasks]);

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading Student Profile...</div>;
  if (!admission) return <div className="p-10 text-center text-red-500 font-medium">Student not found</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950 min-h-screen space-y-6 transition-colors">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/30">
              {admission.fullName?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{admission.fullName}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  admission.studentStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {admission.studentStatus || admission.status}
                </span>
                <PermissionButton
                  permissions={['student.edit']}
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800 transition-all cursor-pointer active:scale-95 ml-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Edit details
                </PermissionButton>

                {/* Section E: Lifecycle Status & Batch Actions */}
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 transition-all cursor-pointer active:scale-95"
                >
                  Update Status
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer active:scale-95"
                >
                  Change Batch
                </button>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {admission.courseApplied} &bull; Reg No: <span className="text-slate-700 dark:text-slate-300 font-semibold">{admission.generatedRegNo || admission.formNo}</span> &bull; Form: {admission.formNo}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
             <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Workflow Target</div>
             <div className="flex gap-2 items-center">
               {stepper.map((t, i) => (
                 <div key={t._id} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : t.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} title={t.taskName}></div>
                    {i < stepper.length -1 && <div className="w-3 h-px bg-slate-300 dark:bg-slate-700"></div>}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-5 shadow-sm backdrop-blur-sm flex gap-4 items-start">
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full text-amber-600 dark:text-amber-400">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.0l-6.928-12.0c-.77-1.333-2.694-1.333-3.464 0l-6.928 12.0c-.77 1.333.192 3.0 1.732 3.0z"/></svg>
          </div>
          <div>
            <div className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-1">Action Required</div>
            <ul className="text-sm text-amber-700 dark:text-amber-300/80 space-y-1 font-medium">
              {warnings.map((w, idx) => <li key={idx}>&bull; {w}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Personal Details
          </h3>
          <div className="space-y-3">
            <div><span className="text-xs text-slate-400 block mb-0.5">Email</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.emailAddress || "-"}</span></div>
            <div><span className="text-xs text-slate-400 block mb-0.5">Contact</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.contactNumber || "-"}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-xs text-slate-400 block mb-0.5">DOB</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.dob ? new Date(admission.dob).toLocaleDateString() : "-"}</span></div>
              <div><span className="text-xs text-slate-400 block mb-0.5">Gender / Category</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.gender} / {admission.category}</span></div>
            </div>
            <div><span className="text-xs text-slate-400 block mb-0.5">Address</span><span className="text-sm leading-tight font-medium text-slate-600 dark:text-slate-300">{[admission.address, admission.district, admission.state, admission.pinCode].filter(Boolean).join(', ')}</span></div>
          </div>
        </div>

        {/* Academic Background */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
             Academic Background
          </h3>
           <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
               <span className="text-xs text-blue-500 font-bold block mb-1">Course Applied</span>
               <span className="text-base font-black text-slate-800 dark:text-slate-100">{admission.courseApplied || "-"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-2">Choosed Subjects</span>
              <div className="flex flex-wrap gap-1.5">
                {admission.subjectsStudied?.map((subj, idx) => (
                  <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-semibold rounded-md border border-indigo-100 dark:border-indigo-800/50">{subj}</span>
                ))}
                {(!admission.subjectsStudied || admission.subjectsStudied.length === 0) && <span className="text-sm text-slate-400 italic">No subjects listed</span>}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Highest Qualification</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{admission.highestEducationalQualification} ({admission.yearOfPassing}) - {admission.boardOrUniversity}</span>
            </div>
          </div>
        </div>

        {/* Fee Collection Box */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden">
           
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Fee Account
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 cursor-pointer active:scale-95 transition-all"
                >
                  ✏ Edit / Pay Fee
                </button>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/50">
                  {feeSummary?.percentage || 0}% Paid
                </span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-slate-100/80 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">Total Fee</span>
                 <span className="text-sm font-black text-slate-900 dark:text-white">&#8377;{feeSummary?.totalFee ?? fee?.finance?.totalFee ?? 0}</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">How Much Paid</span>
                 <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">&#8377;{feeSummary?.paidAmount ?? fee?.finance?.totalPaid ?? 0}</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">How Much Left</span>
                 <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                    &#8377;{feeSummary?.remainingAmount ?? Math.max(0, ((feeSummary?.totalFee ?? fee?.finance?.totalFee ?? 0) - (feeSummary?.paidAmount ?? fee?.finance?.totalPaid ?? 0)))}
                 </span>
              </div>
           </div>

           <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden mb-6">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, feeSummary?.percentage || 0)}%` }} />
           </div>

           <div className="space-y-3">
             {(fee?.installments || []).map((inst) => (
               <div key={inst._id} className="flex flex-col p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Installment {inst.installmentNo}</div>
                     <div className={`text-[10px] font-semibold mt-0.5 ${new Date(inst.dueDate) < new Date() && inst.paidAmount < inst.amount ? 'text-rose-500' : 'text-slate-400'}`}>Due: {new Date(inst.dueDate).toLocaleDateString()}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-sm font-black text-slate-700 dark:text-slate-200">&#8377;{inst.paidAmount} <span className="text-[10px] text-slate-400">/ {inst.amount}</span></div>
                   </div>
                 </div>
               </div>
             ))}
             {(!fee?.installments || fee.installments.length === 0) && (
               <div className="text-center text-sm text-slate-400 py-4 italic">No installments planned</div>
             )}
           </div>
        </div>

        {/* Documents Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
             <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
             Document Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
             {documentFields.map((field) => {
                const rawFile = admission[field.key];
                const isUploaded = Boolean(rawFile && typeof rawFile === 'string' && rawFile.trim());
                const docStatus = admission.documentStatuses?.[field.key] || { status: 'pending', remark: '' };
                const currentStatus = (docStatus.status === 'pending' && isUploaded) ? 'received' : docStatus.status;

                return (
                   <div key={field.key} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-slate-100 dark:border-slate-800/60">
                      <div className="flex flex-col min-w-0 pr-2">
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                           {field.label}
                           {field.isRequired && <span className="ml-1 text-[9px] text-rose-500">*</span>}
                         </span>
                         {isUploaded ? (
                           <a
                             href={getFileUrl(rawFile)}
                             target="_blank"
                             rel="noreferrer"
                             className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold mt-1"
                           >
                             <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                             View Document
                           </a>
                         ) : (
                           <span className="text-[9px] text-slate-400 font-medium mt-0.5">No file uploaded</span>
                         )}
                      </div>
                      <span className={`w-fit px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full shrink-0 ${
                         currentStatus === 'received' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                         currentStatus === 'not_needed' ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                         currentStatus === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                         'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                         {currentStatus.replace('_', ' ')}
                      </span>
                   </div>
                );
             })}
          </div>
        </div>

      </div>

      {/* Workflow Progress Box */}
      <div className="mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
             <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
             Workflow Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
             {stepper.map((t) => (
                <div key={t._id} className={`rounded-xl p-4 border shadow-sm transition-all ${
                  t.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30' :
                  t.status === 'in_progress' ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30' :
                  'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/60'
                }`}>
                   <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 line-clamp-1">{t.taskName}</span>
                      <span className={`w-fit px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                        t.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 
                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 
                        'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                   </div>
                   {t.remarks && t.remarks.length > 0 && (
                      <div className="mt-3 text-[10px] text-slate-500 italic border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                         <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Latest Note:</span>
                         <span className="line-clamp-2" title={t.remarks[t.remarks.length - 1].text}>{t.remarks[t.remarks.length - 1].text}</span>
                      </div>
                   )}
                </div>
             ))}
             {stepper.length === 0 && (
                <div className="col-span-full text-center py-6 text-sm text-slate-400 italic">
                  No workflow tasks recorded for this student.
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Student Audit Trail & Lifecycle History (Section E) */}
      <div className="mt-6">
        <StudentHistorySection studentId={admission._id} />
      </div>

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Student Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update personal, contact, and academic details.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 px-6 py-2 overflow-x-auto gap-2">
              {['Basic Info', 'Contact Info', 'Parents/Guardian', 'Academic Info'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveEditTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeEditTab === tab
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Body / Form Content */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeEditTab === 'Basic Info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Full Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={editForm.fullName || ""}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.fullName && <p className="text-xs text-rose-500 mt-1">{editErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Date of Birth <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={editForm.dob || ""}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.dob && <p className="text-xs text-rose-500 mt-1">{editErrors.dob}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Gender <span className="text-rose-500">*</span></label>
                    <select
                      value={editForm.gender || ""}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Others</option>
                    </select>
                    {editErrors.gender && <p className="text-xs text-rose-500 mt-1">{editErrors.gender}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Category <span className="text-rose-500">*</span></label>
                    <select
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Category</option>
                      <option value="GEN">GEN</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                    {editErrors.category && <p className="text-xs text-rose-500 mt-1">{editErrors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Aadhar No <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={12}
                      value={editForm.aadharNo || ""}
                      onChange={(e) => setEditForm({ ...editForm, aadharNo: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.aadharNo && <p className="text-xs text-rose-500 mt-1">{editErrors.aadharNo}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Religion <span className="text-rose-500">*</span></label>
                    <select
                      value={editForm.religion || ""}
                      onChange={(e) => setEditForm({ ...editForm, religion: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Religion</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Jain">Jain</option>
                      <option value="Other">Other</option>
                    </select>
                    {editErrors.religion && <p className="text-xs text-rose-500 mt-1">{editErrors.religion}</p>}
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Other Info</label>
                    <textarea
                      rows="3"
                      value={editForm.otherInfo || ""}
                      onChange={(e) => setEditForm({ ...editForm, otherInfo: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeEditTab === 'Contact Info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Contact Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={10}
                      value={editForm.contactNumber || ""}
                      onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.contactNumber && <p className="text-xs text-rose-500 mt-1">{editErrors.contactNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Alternate Contact</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={editForm.alternateContactNumber || ""}
                      onChange={(e) => setEditForm({ ...editForm, alternateContactNumber: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.alternateContactNumber && <p className="text-xs text-rose-500 mt-1">{editErrors.alternateContactNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={editForm.emailAddress || ""}
                      onChange={(e) => setEditForm({ ...editForm, emailAddress: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.emailAddress && <p className="text-xs text-rose-500 mt-1">{editErrors.emailAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">State <span className="text-rose-500">*</span></label>
                    {statesData.length > 0 ? (
                      <select
                        value={editForm.state || ""}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value, district: "" })}
                        className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      >
                        <option value="">Select State</option>
                        {statesData.map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editForm.state || ""}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      />
                    )}
                    {editErrors.state && <p className="text-xs text-rose-500 mt-1">{editErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">City/District <span className="text-rose-500">*</span></label>
                    {citiesOfSelectedState.length > 0 ? (
                      <select
                        value={editForm.district || ""}
                        onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                        className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      >
                        <option value="">Select City/District</option>
                        {citiesOfSelectedState.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editForm.district || ""}
                        onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                        className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      />
                    )}
                    {editErrors.district && <p className="text-xs text-rose-500 mt-1">{editErrors.district}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Pin Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editForm.pinCode || ""}
                      onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.pinCode && <p className="text-xs text-rose-500 mt-1">{editErrors.pinCode}</p>}
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Full Address <span className="text-rose-500">*</span></label>
                    <textarea
                      rows="3"
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none"
                    />
                    {editErrors.address && <p className="text-xs text-rose-500 mt-1">{editErrors.address}</p>}
                  </div>
                </div>
              )}

              {activeEditTab === 'Parents/Guardian' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-sm"></div>
                      Father's Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Father's Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={editForm.fathersName || ""}
                          onChange={(e) => setEditForm({ ...editForm, fathersName: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                        {editErrors.fathersName && <p className="text-xs text-rose-500 mt-1">{editErrors.fathersName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Occupation</label>
                        <input
                          type="text"
                          value={editForm.fathersOccupation || ""}
                          onChange={(e) => setEditForm({ ...editForm, fathersOccupation: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Job Role</label>
                        <input
                          type="text"
                          value={editForm.fathersJobRole || ""}
                          onChange={(e) => setEditForm({ ...editForm, fathersJobRole: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Company/Department</label>
                        <input
                          type="text"
                          value={editForm.fathersDepartmentOrCompany || ""}
                          onChange={(e) => setEditForm({ ...editForm, fathersDepartmentOrCompany: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-sm"></div>
                      Mother's Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Mother's Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={editForm.mothersName || ""}
                          onChange={(e) => setEditForm({ ...editForm, mothersName: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                        {editErrors.mothersName && <p className="text-xs text-rose-500 mt-1">{editErrors.mothersName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Occupation</label>
                        <input
                          type="text"
                          value={editForm.mothersOccupation || ""}
                          onChange={(e) => setEditForm({ ...editForm, mothersOccupation: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Job Role</label>
                        <input
                          type="text"
                          value={editForm.mothersJobRole || ""}
                          onChange={(e) => setEditForm({ ...editForm, mothersJobRole: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Company/Department</label>
                        <input
                          type="text"
                          value={editForm.mothersDepartmentOrCompany || ""}
                          onChange={(e) => setEditForm({ ...editForm, mothersDepartmentOrCompany: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-sm"></div>
                      Guardian Details (Optional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Guardian Name</label>
                        <input
                          type="text"
                          value={editForm.guardianName || ""}
                          onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Relation</label>
                        <input
                          type="text"
                          value={editForm.guardianRelation || ""}
                          onChange={(e) => setEditForm({ ...editForm, guardianRelation: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Contact Number</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={editForm.guardianContactNumber || ""}
                          onChange={(e) => setEditForm({ ...editForm, guardianContactNumber: e.target.value })}
                          className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        />
                        {editErrors.guardianContactNumber && <p className="text-xs text-rose-500 mt-1">{editErrors.guardianContactNumber}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeEditTab === 'Academic Info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Highest Educational Qualification <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={editForm.highestEducationalQualification || ""}
                      onChange={(e) => setEditForm({ ...editForm, highestEducationalQualification: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.highestEducationalQualification && <p className="text-xs text-rose-500 mt-1">{editErrors.highestEducationalQualification}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Board / University <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={editForm.boardOrUniversity || ""}
                      onChange={(e) => setEditForm({ ...editForm, boardOrUniversity: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.boardOrUniversity && <p className="text-xs text-rose-500 mt-1">{editErrors.boardOrUniversity}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Year of Passing <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      value={editForm.yearOfPassing || ""}
                      onChange={(e) => setEditForm({ ...editForm, yearOfPassing: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    {editErrors.yearOfPassing && <p className="text-xs text-rose-500 mt-1">{editErrors.yearOfPassing}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Preferred Mode of Learning <span className="text-rose-500">*</span></label>
                    <select
                      value={editForm.preferredModeOfLearning || ""}
                      onChange={(e) => setEditForm({ ...editForm, preferredModeOfLearning: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Mode</option>
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                    {editErrors.preferredModeOfLearning && <p className="text-xs text-rose-500 mt-1">{editErrors.preferredModeOfLearning}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Course Applied <span className="text-rose-500">*</span></label>
                    <select
                      value={editForm.courseApplied || ""}
                      onChange={(e) => setEditForm({ ...editForm, courseApplied: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course.courseName}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                    {editErrors.courseApplied && <p className="text-xs text-rose-500 mt-1">{editErrors.courseApplied}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Subjects Studied (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics, Chemistry, Math"
                      value={editForm.subjectsStudied || ""}
                      onChange={(e) => setEditForm({ ...editForm, subjectsStudied: e.target.value })}
                      className="w-full px-4 py-2 text-sm border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                disabled={savingProfile}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer font-semibold"
              >
                {savingProfile && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Modal (Section C) */}
      <EditFeeModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        studentId={admission._id}
        onFeeUpdated={loadData}
      />

      {/* Change Lifecycle Status Modal (Section E) */}
      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        studentId={admission._id}
        currentStatus={admission.studentStatus || admission.status}
        onStatusChanged={loadData}
      />

      {/* Change Batch Modal (Section E) */}
      <ChangeBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        studentId={admission._id}
        currentBatch={admission.batchName}
        onBatchChanged={loadData}
      />
    </div>
  );
};

export default StudentProfile;
