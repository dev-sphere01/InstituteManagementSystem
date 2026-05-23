import React, { useEffect, useMemo, useState } from 'react';
import workflowService from '../../services/workflowService';
import { useNotification } from '../../services/NotificationService';
import Pagination from '../../components/common/Pagination';

const Fee = () => {
  const notify = useNotification();
  const [view, setView] = useState('search'); // 'search' or 'pay'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [searchParams, setSearchParams] = useState({ name: '', fatherName: '', course: '' });
  
  const [admissions, setAdmissions] = useState([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedSearchParams, setDebouncedSearchParams] = useState(searchParams);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchParams(searchParams), 500);
    return () => clearTimeout(t);
  }, [searchParams]);

  const [loadingFee, setLoadingFee] = useState(false);
  const [finance, setFinance] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [totalFee, setTotalFee] = useState('');
  const [maxInstallments, setMaxInstallments] = useState(3);
  const [firstDueDate, setFirstDueDate] = useState('');
  const [intervalDays, setIntervalDays] = useState(30);
  const [savingPlan, setSavingPlan] = useState(false);

  const [payAmounts, setPayAmounts] = useState({});
  const [payMethods, setPayMethods] = useState({});
  const [payReferences, setPayReferences] = useState({});
  const [payDates, setPayDates] = useState({});

  const [directPayAmount, setDirectPayAmount] = useState('');
  const [directPayMethod, setDirectPayMethod] = useState('Cash');
  const [directPayReference, setDirectPayReference] = useState('');
  const [directPayDate, setDirectPayDate] = useState('');

  const [showInstallments, setShowInstallments] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadAdmissions = async () => {
    setLoadingAdmissions(true);
    try {
      const searchTerms = [];
      if (debouncedSearchParams.name) searchTerms.push(debouncedSearchParams.name);
      if (debouncedSearchParams.fatherName) searchTerms.push(debouncedSearchParams.fatherName);
      if (debouncedSearchParams.course) searchTerms.push(debouncedSearchParams.course);
      
      const params = { limit: itemsPerPage, page: currentPage };
      if (searchTerms.length > 0) {
        params.keyword = searchTerms.join(' ');
      }

      const response = await workflowService.getAdmissions(params);
      setAdmissions(response?.admissions || response?.data?.admissions || response?.data || []);
      setTotalItems(response?.totalCount || response?.admissions?.length || 0);
    } catch (error) {
      notify('Failed to load admissions', 'error');
    } finally {
      setLoadingAdmissions(false);
    }
  };

  const loadFeeSummary = async (targetId) => {
    if (!targetId) return;
    setLoadingFee(true);
    try {
      const response = await workflowService.getFeeSummary({ targetType: 'admission', targetId });
      const data = response?.data || null;
      setFinance(data?.finance || null);
      setInstallments(data?.installments || []);
      setTransactions(data?.transactions || []);

      if (data?.finance?.totalFee !== undefined && data?.finance?.totalFee !== null) {
        setTotalFee(String(data.finance.totalFee));
      }
    } catch (error) {
      notify('Failed to load fee summary', 'error');
    } finally {
      setLoadingFee(false);
    }
  };

  useEffect(() => {
    loadAdmissions();
  }, [currentPage, itemsPerPage, debouncedSearchParams]);

  useEffect(() => {
    if (selectedId) {
      loadFeeSummary(selectedId);
    } else {
      setFinance(null);
      setInstallments([]);
      setTransactions([]);
    }
  }, [selectedId]);

  const selectedAdmission = useMemo(() => {
    return admissions.find((a) => a._id === selectedId);
  }, [admissions, selectedId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchParams]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const remaining = useMemo(() => {
    if (!finance) return 0;
    return Math.max(0, (finance.totalFee || 0) - (finance.totalPaid || 0));
  }, [finance]);

  const generateInstallments = () => {
    const fee = Number(totalFee || 0);
    const count = Number(maxInstallments || 0);
    if (!fee || fee <= 0 || !count || count <= 0) {
      notify('Enter total fee and max installments', 'warning');
      return [];
    }
    if (!firstDueDate) {
      notify('Select first due date', 'warning');
      return [];
    }

    const base = Math.floor(fee / count);
    let remainder = fee - base * count;

    const startDate = new Date(firstDueDate);
    const dueInterval = Number(intervalDays || 0);

    return Array.from({ length: count }, (_, idx) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      const amount = base + extra;
      const dueDate = new Date(startDate);
      if (dueInterval > 0) {
        dueDate.setDate(dueDate.getDate() + dueInterval * idx);
      }
      return {
        installmentNo: idx + 1,
        amount,
        dueDate: dueDate.toISOString().slice(0, 10)
      };
    });
  };

  const savePlan = async () => {
    if (!selectedId) {
      notify('Select a student first', 'warning');
      return;
    }
    const fee = Number(totalFee || 0);
    if (!fee || fee <= 0) {
      notify('Enter total fee', 'warning');
      return;
    }
    const plan = generateInstallments();
    if (plan.length === 0) return;

    setSavingPlan(true);
    try {
      await workflowService.createFeePlan({
        targetType: 'admission',
        targetId: selectedId,
        totalFee: fee,
        installments: plan
      });
      notify('Fee plan saved', 'success');
      await loadFeeSummary(selectedId);
    } catch (error) {
      notify('Failed to save fee plan', 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const validateAndShowConfirm = () => {
    const amount = Number(directPayAmount || 0);
    if (!amount || amount <= 0) {
      notify('Enter a valid payment amount', 'warning');
      return;
    }
    if (directPayMethod === 'UPI' && !directPayReference.trim()) {
      notify('Please enter UTR number for UPI payment', 'warning');
      return;
    }
    setShowConfirmModal(true);
  };

  const submitConfirmedPayment = async () => {
    const amount = Number(directPayAmount || 0);
    const submissionDate = directPayDate ? new Date(directPayDate).toISOString() : new Date().toISOString();

    try {
      const response = await workflowService.directPay({
        targetType: 'admission',
        targetId: selectedId,
        amount,
        method: directPayMethod,
        reference: directPayReference,
        paymentDate: submissionDate
      });

      notify('Direct Payment recorded successfully', 'success');
      setDirectPayAmount('');
      setDirectPayReference('');
      setDirectPayDate('');
      setShowConfirmModal(false);
      
      await loadFeeSummary(selectedId);

      const responseData = response?.data || response;
      const dataPayload = responseData?.data || responseData;
      const transaction = dataPayload?.transaction;
      
      if (transaction) {
        handlePrintReceipt(transaction);
      }
    } catch (error) {
      notify(error?.response?.data?.message || 'Failed to record direct payment', 'error');
    }
  };

  const handlePrintReceipt = (transaction) => {
    if (!selectedAdmission) return;
    const printWindow = window.open('', '_blank');
    const generationTime = new Date().toLocaleString();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .header p { margin: 5px 0 0 0; color: #666; }
            .details { margin-bottom: 30px; display: flex; justify-content: space-between; gap: 20px; }
            .details div { line-height: 1.6; }
            .amount-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; border: 1px solid #eee; }
            .amount-box h2 { margin: 0; font-size: 32px; color: #10b981; }
            .amount-box p { margin: 5px 0 0 0; color: #666; text-transform: uppercase; font-size: 14px; }
            .meta { font-size: 11px; color: #888; background: #fafafa; padding: 10px; border: 1px dashed #ccc; margin-bottom: 30px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature div { border-top: 1px solid #333; padding-top: 5px; width: 200px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Institute Fee Receipt</h1>
            <p>Official Payment Record</p>
          </div>
          <div class="details">
            <div>
              <strong>Student Name:</strong> ${selectedAdmission.fullName}<br/>
              <strong>Father's Name:</strong> ${selectedAdmission.fathersName || 'N/A'}<br/>
              <strong>Form No:</strong> ${selectedAdmission.formNo || 'N/A'}<br/>
              <strong>Course:</strong> ${selectedAdmission.courseApplied || 'N/A'}
            </div>
            <div style="text-align: right;">
              <strong>Receipt No:</strong> ${transaction._id.substring(transaction._id.length - 8).toUpperCase()}<br/>
              <strong>Date of Payment:</strong> ${new Date(transaction.paymentDate).toLocaleString()}<br/>
              <strong>Payment Method:</strong> ${transaction.method || 'Cash'}<br/>
              ${transaction.method === 'UPI' ? '<strong>UTR No:</strong> ' + (transaction.reference || 'N/A') : ''}
            </div>
          </div>
          <div class="amount-box">
            <h2>₹${transaction.amount}</h2>
            <p>Amount Received Successfully</p>
          </div>
          <div class="meta">
            <strong>Metadata:</strong><br/>
            Receipt Generation Time: ${generationTime}<br/>
            Processing Auth: System Generated
          </div>
          <div class="signature">
            <div>Student Signature</div>
            <div>Authorized Signatory</div>
          </div>
          <div class="footer">
            This is a computer-generated receipt and does not require a physical signature.
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSelectStudent = (id) => {
    setSelectedId(id);
    setView('pay');
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500 p-5 text-white shadow-md">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/70">Fee Control</div>
            <h1 className="text-xl font-bold">Student Fee Management</h1>
            <p className="text-sm text-white/80">Search students, collect fee via UPI/Cash, and generate printable receipts instantly.</p>
          </div>
          {view === 'pay' && (
            <button
              onClick={() => { setView('search'); setSelectedId(''); }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors font-medium text-sm border border-white/30 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Search
            </button>
          )}
        </div>
      </div>

      {view === 'search' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Multi-field Student Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Student Name</label>
                 <input
                   type="text"
                   className="w-full border rounded-lg px-3 py-2 text-sm"
                   placeholder="Search name..."
                   value={searchParams.name}
                   onChange={e => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                 />
               </div>
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Father's Name</label>
                 <input
                   type="text"
                   className="w-full border rounded-lg px-3 py-2 text-sm"
                   placeholder="Search father's name..."
                   value={searchParams.fatherName}
                   onChange={e => setSearchParams(prev => ({ ...prev, fatherName: e.target.value }))}
                 />
               </div>
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Course Applied</label>
                 <input
                   type="text"
                   className="w-full border rounded-lg px-3 py-2 text-sm"
                   placeholder="Search course..."
                   value={searchParams.course}
                   onChange={e => setSearchParams(prev => ({ ...prev, course: e.target.value }))}
                 />
               </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-gray-900">Found Students ({totalItems})</h2>
              <div className="flex items-center gap-3">
                {loadingAdmissions && <span className="text-sm text-indigo-600 animate-pulse">Loading dataset...</span>}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" /></svg>
                  </button>
                  <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
            
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {admissions.map(student => (
                  <div key={student._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {student.fullName ? student.fullName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'ST'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{student.fullName}</h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-slate-400">#{student.formNo || "N/A"}</span>
                            {student.courseApplied && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {student.courseApplied}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4 text-xs text-slate-600">
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                          <span className="text-slate-400">Father's Name</span>
                          <span className="font-medium truncate max-w-[120px]" title={student.fathersName}>{student.fathersName || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                          <span className="text-slate-400">Contact</span>
                          <span className="font-medium">{student.contactNumber || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectStudent(student._id)}
                      className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      Collect Fee
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                ))}
                {admissions.length === 0 && !loadingAdmissions && (
                  <div className="col-span-full text-center py-6 text-gray-500 text-sm">
                    No students found matching the criteria.
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="text-left px-3 py-2">Student Name</th>
                      <th className="text-left px-3 py-2">Father's Name</th>
                      <th className="text-left px-3 py-2">Course</th>
                      <th className="text-left px-3 py-2">Form No</th>
                      <th className="text-left px-3 py-2">Contact</th>
                      <th className="text-center px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map(student => (
                      <tr key={student._id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 font-medium text-gray-800">{student.fullName}</td>
                        <td className="px-3 py-2 text-gray-600">{student.fathersName || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{student.courseApplied || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{student.formNo || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{student.contactNumber || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleSelectStudent(student._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
                          >
                            Collect Fee
                          </button>
                        </td>
                      </tr>
                    ))}
                    {admissions.length === 0 && !loadingAdmissions && (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-gray-500">
                          No students found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={startIndex}
              endIndex={startIndex + itemsPerPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageSizeChange={setItemsPerPage}
            />
          </div>
        </div>
      )}

      {view === 'pay' && selectedAdmission && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 border border-slate-200 bg-slate-50 p-4 rounded-xl">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Student Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-800">{selectedAdmission.fullName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Father's Name</span>
                  <span className="font-medium text-slate-800">{selectedAdmission.fathersName || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Course</span>
                  <span className="font-medium text-slate-800">{selectedAdmission.courseApplied || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Form No</span>
                  <span className="font-medium text-slate-800">{selectedAdmission.formNo || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-500">Contact</span>
                  <span className="font-medium text-slate-800">{selectedAdmission.contactNumber || '-'}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">Fee Summary</div>
                  <div className="text-xs text-gray-500">Total fee, paid amount, and remaining balance.</div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 font-semibold transition"
                    onClick={() => setShowInstallments(!showInstallments)}
                  >
                    {showInstallments ? 'Hide Installments' : 'View Installments Details'}
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:underline px-2"
                    onClick={() => loadFeeSummary(selectedId)}
                    disabled={loadingFee}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loadingFee ? (
                <div className="text-sm text-gray-500 flex-1 flex items-center justify-center">Loading fee summary...</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 flex-1">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex flex-col justify-center">
                    <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Total Fee</div>
                    <div className="text-lg font-bold text-slate-800">₹{finance?.totalFee || 0}</div>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 flex flex-col justify-center">
                    <div className="text-[11px] font-semibold text-emerald-600 mb-0.5">Total Paid</div>
                    <div className="text-lg font-bold text-emerald-700">₹{finance?.totalPaid || 0}</div>
                  </div>
                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 flex flex-col justify-center">
                    <div className="text-[11px] font-semibold text-rose-600 mb-0.5">Remaining</div>
                    <div className="text-lg font-bold text-rose-700">₹{remaining}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div>
               <h2 className="text-base font-semibold text-gray-900">Submit Fee Payment</h2>
              <p className="text-sm text-gray-500">Record an arbitrary payment amount. The system dynamically updates any defined installments automatically.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Amount to Pay</label>
                  <input
                    type="number"
                    className="border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-3 py-2 text-sm w-full font-medium"
                    placeholder="0"
                    value={directPayAmount}
                    onChange={(e) => setDirectPayAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Method</label>
                  <select
                    className="border rounded-md px-3 py-2 text-sm w-full bg-slate-50 focus:bg-white"
                    value={directPayMethod}
                    onChange={(e) => setDirectPayMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                {directPayMethod === 'UPI' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">UTR Number</label>
                    <input
                      type="text"
                      className="border rounded-md px-3 py-2 text-sm w-full bg-slate-50 focus:bg-white"
                      placeholder="Ex: 5313..."
                      value={directPayReference}
                      onChange={(e) => setDirectPayReference(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="border rounded-md px-3 py-2 text-sm w-full bg-slate-50 focus:bg-white"
                    value={directPayDate}
                    onChange={(e) => setDirectPayDate(e.target.value)}
                  />
                </div>
                <div className={directPayMethod === 'UPI' ? 'md:col-span-4' : 'md:col-span-1'}>
                  <button
                    className="text-white hover:bg-emerald-600 bg-emerald-500 px-4 py-2 w-full rounded-md text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-1 h-[38px]"
                    onClick={validateAndShowConfirm}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Submit Payment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showInstallments && (
            <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/50 p-4 shadow-sm space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Define Fee Plan</h2>
                  <p className="text-sm text-gray-500">Set maximum fee and structured due dates.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Total Fee</label>
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                      value={totalFee}
                      onChange={(e) => setTotalFee(e.target.value)}
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Max Installments</label>
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                      value={maxInstallments}
                      onChange={(e) => setMaxInstallments(e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">First Due Date</label>
                    <input
                      type="date"
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                      value={firstDueDate}
                      onChange={(e) => setFirstDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Interval (Days)</label>
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 transition"
                    onClick={savePlan}
                    disabled={savingPlan}
                  >
                    {savingPlan ? 'Saving...' : 'Save Fee Plan'}
                  </button>
                </div>
              </div>

              {installments.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Installment Structure Projection</h2>
                    <p className="text-sm text-gray-500">Track how the paid amount covers the defined fee plan sequentially.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="text-left px-3 py-3 rounded-tl-lg">#</th>
                          <th className="text-left px-3 py-3">Due Date</th>
                          <th className="text-left px-3 py-3">Amount</th>
                          <th className="text-left px-3 py-3">Paid Allocation</th>
                          <th className="text-left px-3 py-3 rounded-tr-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installments.map((inst, idx) => (
                          <tr key={inst._id} className={idx !== installments.length - 1 ? "border-b border-slate-100 bg-white" : "bg-white"}>
                            <td className="px-3 py-4">{inst.installmentNo}</td>
                            <td className="px-3 py-4 text-slate-500">{new Date(inst.dueDate).toLocaleDateString()}</td>
                            <td className="px-3 py-4 font-medium text-slate-800">₹{inst.amount}</td>
                            <td className="px-3 py-4 text-emerald-600 font-semibold">₹{inst.paidAmount || 0}</td>
                            <td className="px-3 py-4">
                              <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : inst.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                {inst.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {transactions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Transaction Ledger</h2>
                <p className="text-sm text-gray-500">History of payments and valid printable receipts.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="text-left px-3 py-3 rounded-tl-lg">Receipt No</th>
                      <th className="text-left px-3 py-3">Date of Submission</th>
                      <th className="text-left px-3 py-3">Amount</th>
                      <th className="text-left px-3 py-3">Method</th>
                      <th className="text-left px-3 py-3">Ref / UTR</th>
                      <th className="text-right px-3 py-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trx, idx) => (
                      <tr key={trx._id} className={idx !== transactions.length - 1 ? "border-b border-slate-100" : ""}>
                        <td className="px-3 py-3 font-mono text-xs">{trx._id.substring(trx._id.length - 8).toUpperCase()}</td>
                        <td className="px-3 py-3 font-medium text-slate-700">{new Date(trx.paymentDate).toLocaleString()}</td>
                        <td className="px-3 py-3 text-emerald-600 font-bold">₹{trx.amount}</td>
                        <td className="px-3 py-3">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-semibold">{trx.method || 'Cash'}</span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-500">{trx.reference || '-'}</td>
                        <td className="px-3 py-3 text-right">
                           <button
                             className="text-xs font-semibold px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors inline-flex items-center gap-1.5"
                             onClick={() => handlePrintReceipt(trx)}
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                             Print Receipt
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Fee Submission</h3>
              <p className="text-xs text-gray-500 mb-5">Please verify the payment details below. A receipt will be generated automatically.</p>
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Student</span>
                  <span className="font-bold text-slate-800">{selectedAdmission?.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Amount</span>
                  <span className="font-bold text-emerald-600 text-lg">₹{directPayAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Method</span>
                  <span className="font-bold text-slate-800">{directPayMethod}</span>
                </div>
                {directPayMethod === 'UPI' && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">UTR Number</span>
                    <span className="font-bold text-slate-800">{directPayReference || '-'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="font-bold text-slate-800">
                    {directPayDate ? new Date(directPayDate).toLocaleString() : 'Current Time'}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                onClick={submitConfirmedPayment}
              >
                Confirm & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fee;
