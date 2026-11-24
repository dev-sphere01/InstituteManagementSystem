import React, { useState, useEffect } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const EditFeeModal = ({ isOpen, onClose, studentId, onFeeUpdated }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feePlan, setFeePlan] = useState(null);
  const [installments, setInstallments] = useState([]);
  
  // Edit Form
  const [totalFee, setTotalFee] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [numInstallments, setNumInstallments] = useState(1);
  const [rebuildInstallments, setRebuildInstallments] = useState(false);

  // Payment record state
  const [payingInstId, setPayingInstId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const loadFeePlan = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await API.get(`/fees/plan/${studentId}?targetType=admission`);
      if (res && res.success) {
        setFeePlan(res.finance);
        setInstallments(res.installments || []);
        if (res.finance) {
          setTotalFee(res.finance.totalFee || '');
          setDiscountAmount(res.finance.discountAmount || 0);
          setDiscountPercent(res.finance.discountPercent || 0);
          setNumInstallments(res.finance.numInstallments || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load fee plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFeePlan();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const netPayable = Math.max(
    0,
    (Number(totalFee) || 0) -
      (discountPercent > 0
        ? ((Number(totalFee) || 0) * discountPercent) / 100
        : Number(discountAmount) || 0)
  );

  const handleSaveFeePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/fees/setup', {
        targetType: 'admission',
        targetId: studentId,
        totalFee: Number(totalFee),
        discountAmount: Number(discountAmount),
        discountPercent: Number(discountPercent),
        numInstallments: Number(numInstallments),
        rebuildInstallments,
      });
      notify('Fee plan updated successfully', 'success');
      if (onFeeUpdated) onFeeUpdated();
      loadFeePlan();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update fee plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (instId) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      notify('Enter a valid payment amount', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await API.patch(`/fees/installments/${instId}/pay`, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        paymentDate: new Date().toISOString(),
      });
      notify('Payment recorded successfully', 'success');
      setPayingInstId(null);
      setPaymentAmount('');
      if (onFeeUpdated) onFeeUpdated();
      loadFeePlan();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>💳</span> Update Fees &amp; Record Installment Payment
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify student course fees, grant discounts, and record incoming installment payments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1.5"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading fee account...</div>
          ) : (
            <>
              {/* Fee Adjustment Form */}
              <form onSubmit={handleSaveFeePlan} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Fee Structure Setup</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Total Fee (₹)</label>
                    <input
                      type="number"
                      value={totalFee}
                      onChange={(e) => setTotalFee(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border dark:border-slate-700 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Discount (₹ or %)</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={discountAmount}
                        onChange={(e) => { setDiscountAmount(e.target.value); setDiscountPercent(0); }}
                        className="w-1/2 px-2 py-1.5 rounded-lg border dark:border-slate-700 dark:bg-slate-800"
                      />
                      <input
                        type="number"
                        placeholder="% Pct"
                        value={discountPercent}
                        onChange={(e) => { setDiscountPercent(e.target.value); setDiscountAmount(0); }}
                        className="w-1/2 px-2 py-1.5 rounded-lg border dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Net Payable</label>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black">
                      ₹{netPayable.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rebuildInstallments}
                      onChange={(e) => setRebuildInstallments(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Re-calculate and reset unpaid EMIs based on new net fee</span>
                  </label>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Installments & Payment Collection */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Student Installments</h4>
                {installments.length === 0 ? (
                  <p className="text-slate-400 italic py-2">No installments found for this student.</p>
                ) : (
                  installments.map((inst) => (
                    <div key={inst._id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          EMI #{inst.installmentNo} — ₹{inst.amount}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Due: {new Date(inst.dueDate).toLocaleDateString()} | Paid: <span className="font-bold text-emerald-600">₹{inst.paidAmount || 0}</span> | Status: <span className={`font-semibold ${inst.status === 'Paid' ? 'text-emerald-500' : inst.status === 'Overdue' ? 'text-rose-500' : 'text-amber-500'}`}>{inst.status}</span>
                        </div>
                      </div>

                      {inst.status !== 'Paid' && (
                        <div>
                          {payingInstId === inst._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-24 px-2 py-1 rounded border dark:border-slate-700 dark:bg-slate-900"
                              />
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="px-2 py-1 rounded border dark:border-slate-700 dark:bg-slate-900"
                              >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI / Online</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRecordPayment(inst._id)}
                                disabled={submitting}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                              >
                                Record
                              </button>
                              <button
                                type="button"
                                onClick={() => setPayingInstId(null)}
                                className="px-2 py-1 text-slate-400 hover:text-slate-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setPayingInstId(inst._id);
                                setPaymentAmount(inst.amount - (inst.paidAmount || 0));
                              }}
                              className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg font-bold hover:bg-emerald-100"
                            >
                              + Pay EMI
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFeeModal;
