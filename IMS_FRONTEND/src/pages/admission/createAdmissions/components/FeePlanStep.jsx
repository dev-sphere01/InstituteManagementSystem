import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';
import API from '../../../../services/API';
import DatePicker from '../../../../components/common/DatePicker';

const FeePlanStep = ({ formId, formData = {}, setFormData, onNext, onBack, validationsEnabled = true }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();

  const [totalFee, setTotalFee] = useState(formData.totalFee || '');
  const [discountType, setDiscountType] = useState(formData.discountType || 'amount'); // 'amount' | 'percent'
  const [discountValue, setDiscountValue] = useState(formData.discountValue || 0);
  const [numInstallments, setNumInstallments] = useState(formData.numInstallments || 1);
  const [installmentDuration, setInstallmentDuration] = useState(formData.installmentDuration || 1);
  const [startDate, setStartDate] = useState(formData.feeStartDate || new Date().toISOString().substring(0, 10));
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Compute discount amount and net payable
  const numTotal = Number(totalFee) || 0;
  const numDiscVal = Number(discountValue) || 0;
  const computedDiscountAmount =
    discountType === 'percent'
      ? Math.round((numTotal * Math.min(100, Math.max(0, numDiscVal))) / 100)
      : Math.min(numTotal, Math.max(0, numDiscVal));
  const computedNetPayable = Math.max(0, numTotal - computedDiscountAmount);

  // Auto-generate installments when total, discount, numInstallments, or startDate changes
  useEffect(() => {
    const n = Math.max(1, parseInt(numInstallments, 10) || 1);
    const emiAmount = Math.floor(computedNetPayable / n);
    const remainder = computedNetPayable - emiAmount * (n - 1);

    const generated = [];
    const baseDate = startDate ? new Date(startDate) : new Date();

    for (let i = 1; i <= n; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + (i - 1) * (parseInt(installmentDuration, 10) || 1));
      const dateStr = !isNaN(d.getTime()) ? d.toISOString().substring(0, 10) : '';

      // Month name for Expected Month suggestion
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const expectedMonthStr = !isNaN(d.getTime()) ? `${monthNames[d.getMonth()]} ${d.getFullYear()}` : '';

      generated.push({
        installmentNo: i,
        amount: i === n ? remainder : emiAmount,
        dueDate: dateStr,
        expectedMonth: expectedMonthStr,
      });
    }
    setInstallments(generated);
  }, [numTotal, discountType, discountValue, numInstallments, installmentDuration, startDate]);

  const handleInstallmentChange = (index, field, value) => {
    setInstallments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const validate = () => {
    if (!validationsEnabled) return true;
    const errs = {};
    if (!numTotal || numTotal <= 0) {
      errs.totalFee = 'Total fee must be greater than 0';
    }
    if (computedNetPayable < 0) {
      errs.discountValue = 'Discount cannot exceed total fee';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      notify('Please resolve fee validation errors.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        targetType: 'admission',
        targetId: formId,
        totalFee: numTotal,
        discountAmount: computedDiscountAmount,
        discountPercent: discountType === 'percent' ? numDiscVal : 0,
        netPayable: computedNetPayable,
        numInstallments: parseInt(numInstallments, 10) || 1,
        installmentDurationMonths: parseInt(installmentDuration, 10) || 1,
        startDate,
        rebuildInstallments: true,
      };

      if (formId) {
        await API.post('/fees/setup', payload);
      }

      const mergedData = {
        ...formData,
        totalFee: numTotal,
        discountType,
        discountValue: numDiscVal,
        discountAmount: computedDiscountAmount,
        netPayable: computedNetPayable,
        numInstallments,
        installmentDuration,
        feeStartDate: startDate,
        feeInstallments: installments,
      };
      setFormData(mergedData);
      notify('Fee & Installment Plan saved successfully.', 'success');
      if (typeof onNext === 'function') onNext(mergedData);
    } catch (err) {
      console.error('Failed to save fee setup:', err);
      notify(err.response?.data?.message || 'Failed to save fee plan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`;

  const labelClass = `block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  return (
    <div
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
            Step 4B: Fees &amp; Installments Plan
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure customized student course fees, discounts, and auto-suggested EMI schedule.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          Individual Pricing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Fee */}
        <div>
          <label className={labelClass}>
            Total Fee (₹) {validationsEnabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            min={0}
            name="totalFee"
            value={totalFee}
            onChange={(e) => setTotalFee(e.target.value)}
            placeholder="e.g. 25000"
            className={inputClass('totalFee')}
          />
          {errors.totalFee && <p className="text-xs text-red-400 mt-1">{errors.totalFee}</p>}
        </div>

        {/* Discount Field (Amount or %) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`${labelClass} mb-0`}>Discount</label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDiscountType('amount')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  discountType === 'amount'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                ₹ (Flat)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('percent')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  discountType === 'percent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                % (Pct)
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={discountType === 'percent' ? 100 : numTotal}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? 'e.g. 10%' : 'e.g. 2000'}
              className={inputClass('discountValue')}
            />
            {discountType === 'percent' && (
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">%</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Calculated Discount: ₹{computedDiscountAmount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Net Payable Summary */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col justify-center">
          <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-300">
            Net Payable Fee
          </span>
          <span className="text-2xl font-black text-blue-900 dark:text-white mt-1">
            ₹{computedNetPayable.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Number of Installments */}
        <div>
          <label className={labelClass}>Number of Installments (EMIs)</label>
          <select
            value={numInstallments}
            onChange={(e) => setNumInstallments(e.target.value)}
            className={inputClass('numInstallments')}
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Installment (Lump-sum)' : 'Installments'}
              </option>
            ))}
          </select>
        </div>

        {/* Installment Duration */}
        <div>
          <label className={labelClass}>Installment Frequency</label>
          <select
            value={installmentDuration}
            onChange={(e) => setInstallmentDuration(e.target.value)}
            className={inputClass('installmentDuration')}
          >
            <option value={1}>Every 1 Month (Monthly)</option>
            <option value={2}>Every 2 Months (Bi-monthly)</option>
            <option value={3}>Every 3 Months (Quarterly)</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className={labelClass}>First Installment Due Date</label>
          <DatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="yyyy-mm-dd"
            className={inputClass('startDate')}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Suggested EMI Breakdown Table */}
      <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Suggested Installment (EMI) Breakdown
          </h4>
          <span className="text-xs text-gray-500">Amounts and dates can be adjusted</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/60 uppercase font-bold text-gray-500 border-b dark:border-gray-800">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Amount (₹)</th>
                <th className="py-2.5 px-4">Expected Month</th>
                <th className="py-2.5 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {installments.map((inst, index) => (
                <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                  <td className="py-2.5 px-4 font-bold text-blue-600">EMI {inst.installmentNo}</td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      value={inst.amount}
                      onChange={(e) => handleInstallmentChange(index, 'amount', Number(e.target.value))}
                      className="w-28 px-2 py-1 rounded border dark:border-gray-700 dark:bg-gray-800 font-bold"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={inst.expectedMonth}
                      onChange={(e) => handleInstallmentChange(index, 'expectedMonth', e.target.value)}
                      placeholder="e.g. OCT 2026"
                      className="w-32 px-2 py-1 rounded border dark:border-gray-700 dark:bg-gray-800 font-semibold"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="date"
                      value={inst.dueDate}
                      onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)}
                      className="px-2 py-1 rounded border dark:border-gray-700 dark:bg-gray-800"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t mt-8 border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isDarkMode
              ? 'border border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white'
              : 'border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-900'
          }`}
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }`}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default FeePlanStep;
