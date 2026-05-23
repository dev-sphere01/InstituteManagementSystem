import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import studentService from "../../../services/studentService";
import workflowService from "../../../services/workflowService";
import { PermissionButton, usePermissions } from "../../../components/PermissionGuard";
import API from "../../../services/API";

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
           
           <div className="flex justify-between items-end mb-6">
              <div>
                 <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                   <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                   Fee Account
                 </h3>
                 <div className="text-2xl font-black text-slate-900 dark:text-white">&#8377;{feeSummary?.paidAmount || 0} <span className="text-sm font-semibold text-slate-400">/ &#8377;{feeSummary?.totalFee || 0}</span></div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-500">{feeSummary?.percentage || 0}%</span>
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
                const docStatus = admission.documentStatuses?.[field.key] || { status: 'pending', remark: '' };
                return (
                   <div key={field.key} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                           {field.label}
                           {field.isRequired && <span className="ml-1 text-[9px] text-rose-500">*</span>}
                         </span>
                      </div>
                      <span className={`w-fit px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                         docStatus.status === 'received' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                         docStatus.status === 'not_needed' ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                         docStatus.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                         'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                         {docStatus.status.replace('_', ' ')}
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
    </div>
  );
};

export default StudentProfile;
