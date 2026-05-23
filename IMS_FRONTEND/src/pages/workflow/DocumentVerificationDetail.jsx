import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/API";
import { useNotification } from "../../services/NotificationService";

const DocumentVerificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();
  
  const [student, setStudent] = useState(null);
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [remarkModal, setRemarkModal] = useState({ isOpen: false, docKey: "", status: "", text: "" });

  const [documentFields, setDocumentFields] = useState([]);

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

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      const response = await API.get(`/students/${id}`);
      if (response.success && response.data?.admission) {
        setStudent(response.data.admission);
        setFeeInfo(response.data.fee);
      } else {
        notify("Student not found", "error");
        navigate("/dashboard/workflow/tasks/document-verification");
      }
    } catch (error) {
      notify("Failed to fetch student data", "error");
      navigate("/dashboard/workflow/tasks/document-verification");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (docKey, newStatus, remarkText = "") => {
    try {
      const response = await API.put(`/students/${id}/documents`, {
        docKey,
        status: newStatus,
        remark: remarkText
      });
      if (response.success) {
        notify(`Document marked as ${newStatus.replace('_', ' ')}`, "success");
        setStudent(prev => ({
           ...prev,
           documentStatuses: {
               ...(prev.documentStatuses || {}),
               [docKey]: { status: newStatus, remark: remarkText }
           }
        }));
      }
    } catch (error) {
      notify(error.response?.data?.message || "Failed to update status", "error");
    }
  };

  const handleOpenRemarkModal = (docKey, status = "rejected") => {
    setRemarkModal({ isOpen: true, docKey, status, text: "" });
  };

  const submitRemarkStatus = () => {
    handleUpdateStatus(remarkModal.docKey, remarkModal.status, remarkModal.text);
    setRemarkModal({ isOpen: false, docKey: "", status: "", text: "" });
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="p-3 md:p-4 min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate("/dashboard/workflow/tasks/document-verification")}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Details & Verification</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Comprehensive view of {student.fullName}'s profile and documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-start">
               <div>
                  <h2 className="text-lg font-bold text-slate-800">{student.fullName}</h2>
                  <div className="flex gap-2 items-center mt-2">
                     <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-indigo-50 text-indigo-600 rounded">
                        {student.courseApplied || 'No Course'}
                     </span>
                     <span className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded ${
                         student.studentStatus === 'Active' || student.studentStatus === 'Admitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                     }`}>
                        {student.studentStatus || student.status}
                     </span>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4">
               <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registration Number</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{student.generatedRegNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Form Number</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{student.formNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Details</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{student.contactNumber || 'N/A'}</p>
                    {student.emailAddress && <p className="text-sm font-medium text-slate-600">{student.emailAddress}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Demographics</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                       {student.gender}, {student.category}, {new Date(student.dob).toLocaleDateString()}
                    </p>
                  </div>
               </div>
               <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Parents Info</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Father: {student.fathersName}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Mother: {student.mothersName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Address</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{student.district}, {student.state}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{student.address}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Side Cards: Actions & Fees */}
          <div className="flex flex-col gap-4">
             {/* Fee Summary */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Fee Overview</h3>
                {feeInfo?.finance ? (
                   <div className="flex flex-col gap-3 font-medium">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500">Total Fee</span>
                         <span className="font-bold text-slate-800">₹{feeInfo.finance.totalFee}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-emerald-600">Total Paid</span>
                         <span className="font-bold text-emerald-600">₹{feeInfo.finance.totalPaid}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                         <span className="text-rose-500 font-bold">Due</span>
                         <span className="font-bold text-rose-500">₹{(feeInfo.finance.totalFee - feeInfo.finance.totalPaid) || 0}</span>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-bold">
                         Paid Progress
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                        <div 
                           className="bg-emerald-500 h-2 rounded-full" 
                           style={{ width: `${Math.min(feeInfo.summary?.percentage || 0, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-right mt-1 font-bold text-slate-600">{feeInfo.summary?.percentage || 0}%</div>
                   </div>
                ) : (
                   <div className="text-sm text-slate-400 italic">No fee data configured yet.</div>
                )}
             </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
               <h3 className="font-bold text-base text-slate-800">Submitted Documents Checklist</h3>
               <p className="text-xs text-slate-500 mt-1">Review physical or digital documents and mark status accordingly.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {documentFields.map((field) => {
              const fileUrl = student[field.key];
              const docState = student.documentStatuses?.[field.key] || { status: 'pending', remark: '' };
              const isPending = docState.status === 'pending';
              const isReceived = docState.status === 'received';
              const isNotNeeded = docState.status === 'not_needed';

              return (
                <div key={field.key} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:bg-slate-50/50">
                  <div className="flex max-w-sm w-full shrink-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{field.label}</h4>
                        {field.isRequired && (
                          <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">Required</span>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded text-white ${
                            isReceived ? 'bg-emerald-500' : 
                            isNotNeeded ? 'bg-slate-400' : 
                            isPending ? 'bg-amber-500' : 'bg-rose-500' 
                        }`}>{docState.status.replace('_', ' ')}</span>
                      </div>
                      
                      {!fileUrl && (
                         <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2 bg-slate-100 px-2 py-1 rounded w-fit">
                           No Digital Copy
                         </p>
                      )}
                      
                      {docState.remark && (
                         <div className="mt-2 text-[11px] font-medium bg-rose-50 border border-rose-100 text-rose-700 p-2 rounded shadow-sm">
                            <span className="font-bold uppercase tracking-wider text-[9px] bg-rose-100 px-1 py-0.5 rounded mr-1">Remark</span> {docState.remark}
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Document View / Action Links */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full justify-end">
                    {/* View Button */}
                    {fileUrl && (
                      <a 
                        href={fileUrl} target="_blank" rel="noreferrer"
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        View Document
                      </a>
                    )}

                    {/* Actions */}
                    {isPending && (
                       <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                          <button 
                            onClick={() => handleUpdateStatus(field.key, 'received')}
                            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm shadow-emerald-500/20 whitespace-nowrap"
                          >
                            Received
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(field.key, 'not_needed')}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                          >
                            Not Needed
                          </button>
                          <button 
                            onClick={() => handleOpenRemarkModal(field.key, 'rejected')}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-rose-200 whitespace-nowrap"
                          >
                            Reject
                          </button>
                       </div>
                    )}
                    
                    {!isPending && (
                       <button 
                          onClick={() => handleUpdateStatus(field.key, 'pending', '')}
                          className="px-3 py-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                          title="Reset to Pending"
                       >
                         Reset
                       </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Remark Modal */}
      {remarkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-sm w-full overflow-hidden">
            <div className="p-5 pb-2">
              <h3 className="text-base font-bold text-slate-800 mb-1">Change Status <span className="text-rose-500 capitalize">{remarkModal.status}</span></h3>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                You may provide an optional remark for why this document is marked as {remarkModal.status}. This will assist in audit logs.
              </p>
              
              <textarea 
                autoFocus
                value={remarkModal.text}
                onChange={(e) => setRemarkModal(prev => ({...prev, text: e.target.value}))}
                placeholder="Type your optional remark here..."
                className="w-full h-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none resize-none transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="bg-slate-50 px-5 py-3 flex justify-end gap-2 border-t border-slate-100 mt-3">
              <button 
                onClick={() => setRemarkModal({ isOpen: false, docKey: "", status: "", text: "" })}
                className="px-4 py-2 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-200/60 transition-colors uppercase tracking-wider"
              >
                CANCEL
              </button>
              <button 
                onClick={submitRemarkStatus}
                className="px-4 py-2 rounded-lg text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all uppercase tracking-wider"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationDetail;
