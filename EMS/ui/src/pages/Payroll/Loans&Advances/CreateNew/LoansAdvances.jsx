import { API, notification } from '@/services';
import getLoanById from '@/services/LoansAdvances/GetLoansByEmployee';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PayrollService from '@/services/Payroll/payrollService';
import React, { use, useEffect, useMemo, useState } from 'react';
import { FaMoneyCheckAlt, FaClipboardList, FaCheckCircle, FaHistory, FaTimes } from 'react-icons/fa';
import { BadgePercent, Info, Receipt, TrendingUp, Edit2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ViewActive from './../ViewActive/ViewActive';
import { Employees } from '@/services';

const LoanAdvanceManagement = () => {
  const notify = notification();

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  // EMI Calculator State
  const [emiFields, setEmiFields] = useState({ amount: '', term: '' });
  const [emiResult, setEmiResult] = useState(null);
  const [isApprovedBy, setIsApprovedBy] = useState('');

  // Loan form states
  const initialFormState = {
    monthlyInstallment: '',
    amount: '',
    reason: '',
    startDate: '' // optional; if provided, will be used as StartDate
  };
  const [form, setForm] = useState(initialFormState);

  // Requests for selected employee
  const [request, setRequest] = useState([]);

  // Edit loan modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [editForm, setEditForm] = useState({
    additionalAmount: '', // Changed from 'amount' to 'additionalAmount'
    monthlyInstallment: '',
    effectiveDate: ''
  });

  // Derived values
  const period = useMemo(() => {
    const amt = parseFloat(form.amount);
    const emi = parseFloat(form.monthlyInstallment);
    if (!amt || isNaN(emi) || emi < 0) return '';
    if (emi === 0) return 0; // arrear/side payment mode
    const p = Math.ceil(amt / emi);
    return Number.isFinite(p) ? (Number.isInteger(p) ? p : p.toFixed(2)) : '';
  }, [form.amount, form.monthlyInstallment]);

  // Computed period for edit form (based on new total amount)
  const editPeriod = useMemo(() => {
    if (!selectedLoan) return '';
    const originalAmount = parseFloat(selectedLoan.LoanAmount) || 0;
    const additionalAmount = parseFloat(editForm.additionalAmount) || 0;
    const newTotalAmount = originalAmount + additionalAmount;
    const emi = parseFloat(editForm.monthlyInstallment);
    
    if (newTotalAmount <= 0 || isNaN(emi) || emi < 0) return '';
    if (emi === 0) return 0;
    const p = Math.ceil(newTotalAmount / emi);
    return Number.isFinite(p) ? (Number.isInteger(p) ? p : p.toFixed(2)) : '';
  }, [editForm.additionalAmount, editForm.monthlyInstallment, selectedLoan]);

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const list = await getAllDepartments();
        setDepartments(list || []);
      } catch (err) {
        console.error('Failed to load departments', err);
        notify.error('Failed to load departments');
      }
    };
    loadDepartments();
  }, []);

  // Load employees when department changes
  useEffect(() => {
    const loadEmployees = async () => {
      if (!deptId) {
        setEmployees([]);
        setSelectedEmpId('');
        setRequest([]);
        return;
      }
      try {
        const list = await PayrollService.getEmployeesByDepartment(deptId);
        setEmployees(Array.isArray(list) ? list : []);
        setSelectedEmpId('');
        setRequest([]);
      } catch (err) {
        console.error('Failed to load employees', err);
        // notify.error('Failed to load employees');
      }
    };
    loadEmployees();
  }, [deptId]);

  // Load requests when employee changes
  useEffect(() => {
    const loadEmployeeRequests = async () => {
      if (!selectedEmpId) {
        setRequest([]);
        return;
      }
      try {
        const data = await getLoanById.getLoanByEmp(selectedEmpId);
        setRequest(Array.isArray(data) ? data : (data ? [data] : []));
        console.log(data);
      } catch (err) {
        console.error('Failed to load employee requests', err);
        notify.error('Failed to load loan requests');
      }
    };
    loadEmployeeRequests();

  }, [selectedEmpId]);
  

  const handleSubmit = async () => {
    // Basic validations
    const amount = parseFloat(form.amount);
    const emi = parseFloat(form.monthlyInstallment);

    if (!selectedEmpId) return notify.error('Please select an employee');
    if (!amount || amount <= 0) return notify.error('Enter a valid amount');
    // Allow 0 installment to indicate arrear/side payment; disallow negatives/NaN
    if (isNaN(emi) || emi < 0) return notify.error('Enter a valid monthly installment (0 for arrear/side payment)');
    if (!form.reason?.trim()) return notify.error('Please enter a reason');

    // If EMI is 0, treat as arrear/side payment (no schedule)
    const period = emi === 0 ? 0 : Math.ceil(amount / emi);
    const payload = {
      EmpID: parseInt(selectedEmpId),
      LoanAmount: amount,
      Period: period,
      InterestRate: 0,
      MonthlyInstallment: emi,
      StartDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      Description: form.reason.trim()
    };

    try {
      const response = await API.post('/LnAs', payload);
      console.log('Response:', response.data);
      notify.success('Loan request submitted successfully!');
      // Reload requests for this employee
      const data = await getLoanById.getLoanByEmp(selectedEmpId);
      setRequest(Array.isArray(data) ? data : (data ? [data] : []));
      setForm(initialFormState);
    } catch (error) {
      console.error('Submission failed:', error);
      notify.error('There was an error submitting the request.');
    }
  };

  const isFormDisabled = !selectedEmpId;
  const handleEmiChange = e => {
    const { name, value } = e.target;
    setEmiFields(f => ({ ...f, [name]: value }));
    setEmiResult(null);
  }
  const handleEmiSubmit = e => {
    e.preventDefault();
    const emi = calculateEMI(Number(emiFields.amount), Number(emiFields.term));
    setEmiResult(emi);
  }

  // Handle loan click to open edit modal
  const handleLoanClick = (loan) => {
    setSelectedLoan(loan);
    setEditForm({
      additionalAmount: '', // Start with empty, user enters additional amount
      monthlyInstallment: loan.Installment || '',
      effectiveDate: '' // Default to empty, user must select
    });
    setIsEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLoan(null);
    setEditForm({ additionalAmount: '', monthlyInstallment: '', effectiveDate: '' });
  };

  // Handle update loan
  const handleUpdateLoan = async () => {
    if (!selectedLoan) return;

    const additionalAmount = parseFloat(editForm.additionalAmount) || 0;
    const newEmi = parseFloat(editForm.monthlyInstallment);
    const originalAmount = parseFloat(selectedLoan.LoanAmount) || 0;
    const originalEmi = parseFloat(selectedLoan.Installment) || 0;

    // Validations
    const newTotalAmount = originalAmount + additionalAmount;
    if (newTotalAmount <= 0) return notify.error('Total loan amount cannot be zero or negative');
    if (isNaN(newEmi) || newEmi < 0) return notify.error('Enter a valid monthly installment (0 for arrear/side payment)');
    if (!editForm.effectiveDate) return notify.error('Please select an effective date for the loan update');

    // Check what changed
    const isLoanAmountChanged = additionalAmount !== 0;
    const isInstallmentChanged = newEmi !== originalEmi;

    // At least one field must change
    if (!isLoanAmountChanged && !isInstallmentChanged) {
      return notify.error('No changes detected. Please modify amount or installment.');
    }

    const payload = {
      LnAID: selectedLoan.LoanID,
      isLoanAmountChanged: isLoanAmountChanged,
      AdditionAmount: isLoanAmountChanged ? additionalAmount : null,
      isInstallmentChanged: isInstallmentChanged,
      NewMonthlyInstallment: isInstallmentChanged ? newEmi : null,
      EffectiveDate: new Date(editForm.effectiveDate).toISOString()
    };

    try {
      const response = await API.put('/LnAs/UpdateLoanAndBalances', payload);
      console.log('Update Response:', response.data);
      notify.success('Loan updated successfully!');
      
      // Reload requests for this employee
      const data = await getLoanById.getLoanByEmp(selectedEmpId);
      setRequest(Array.isArray(data) ? data : (data ? [data] : []));
      
      handleCloseEditModal();
    } catch (error) {
      console.error('Update failed:', error);
      notify.error('There was an error updating the loan.');
    }
  };

  return (
    <>
      <div className="p-6 md:p-5 bg-gradient-to-br from-gray-100 to-white min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">💼 Loans & Advances Management</h1>
        <ViewActive />

        {/* EMI Calculator */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="bg-white border rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow">
            <div>
              <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-1">
                <BadgePercent className="w-5 h-5" /> EMI Calculator
              </h2>
              <p className="text-gray-500 text-sm mb-3">Estimate your monthly repayments before applying.</p>
              <form onSubmit={handleEmiSubmit} className="flex flex-wrap items-center gap-2">
                <input type="number" name="amount" min="1000" placeholder="Amount" value={emiFields.amount} onChange={handleEmiChange}
                  className="bg-gray-50 border px-2 py-1 rounded-md w-28 text-sm focus:ring-2 ring-blue-200" />
                <input type="number" name="term" min="1" max="60" placeholder="Months" value={emiFields.term} onChange={handleEmiChange}
                  className="bg-gray-50 border px-2 py-1 rounded-md w-20 text-sm" />

                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Check EMI
                </button>
                {emiResult !== null && (
                  <div className="ml-4 text-blue-700 font-semibold text-sm flex items-center gap-2">
                    Monthly EMI: {formatCurr(emiResult)}
                  </div>
                )}
              </form>
            </div>
            <div className="flex flex-col space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Receipt className="w-4 h-4" /> Interest-free Loans/Advances with quick disbursal</div>
              <div className="flex items-center gap-1"><Info className="w-4 h-4" /> No hidden charges, fair and transparent process</div>
            </div>
          </div>
        </motion.section>


        {/* Selection Panel */}
        <div className="bg-white shadow-lg p-6 rounded-lg mb-8 transition hover:shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <FaClipboardList className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Select Department & Employee</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Department */}
            <label className="block">
              <span className="text-gray-700">Department</span>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>
                ))}
              </select>
            </label>

            {/* Employee */}
            <label className="block md:col-span-2">
              <span className="text-gray-700">Employee</span>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                disabled={!deptId || employees.length === 0}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
              >
                <option value="">{!deptId ? 'Select department first' : employees.length ? 'Select employee' : 'No employees found'}</option>
                {employees.map((emp) => (
                  <option key={emp.EmpID} value={emp.EmpID}>
                    {emp.EmpID} - {emp.FirstName} {emp.LastName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Request Form */}
          <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl  col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FaMoneyCheckAlt className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Create Loan/Advance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-gray-700">Amount</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Enter amount"
                  disabled={isFormDisabled}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Monthly Installment</span>
                <input
                  type='number'
                  min="0"
                  value={form.monthlyInstallment}
                  onChange={(e) => setForm({ ...form, monthlyInstallment: e.target.value })}
                  disabled={isFormDisabled || !form.amount}
                  placeholder='Enter monthly installment (0 for arrear/side payment)'
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500">Period: {period === '' ? '-' : period}</p>
                <p className="text-xs text-gray-400 mt-1">Enter 0 to record an arrear/side payment (no repayment schedule).</p>
              </label>
              <label className="block">
                <span className="text-gray-700">Start Date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  placeholder="Select start date"
                  disabled={isFormDisabled}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
              <label className="block col-span-2">
                <span className="text-gray-700">Reason</span>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Enter reason"
                  rows="3"
                  disabled={isFormDisabled}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isFormDisabled}
              className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2 rounded shadow"
            >
              Submit Request
            </button>
          </div>

          {/* Repayment Info (static placeholder) */}
          {/* <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <FaHistory className="text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Repayment Status</h2>
            </div>
            <p className="text-gray-800 text-md mb-1">
              <strong>Outstanding Balance:</strong> ₹10,000
            </p>
            <p className="text-gray-800 text-md mb-3">
              <strong>Next EMI:</strong> ₹1,000 on <span className="text-blue-600 font-medium">1st Aug 2025</span>
            </p>
            <div>
              <p className="text-gray-700 mb-2 font-semibold">Repayment History:</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>1st Jul 2025 - ₹1,000 - <span className="text-green-600">Paid</span></li>
                <li>1st Jun 2025 - ₹1,000 - <span className="text-green-600">Paid</span></li>
              </ul>
            </div>
          </div> */}

          {/* Request Status - Multiple Loans */}
          <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <FaCheckCircle className="text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Loan Request Status</h2>
            </div>

            {!selectedEmpId ? (
              <p className="text-gray-600">Select a department and employee to view loan requests.</p>
            ) : !request || request.length === 0 ? (
              <p className="text-gray-600">No loan requests found.</p>
            ) : (
              <ul className="space-y-4">
                {request.map((loan) => (
                  <li 
                    key={loan.LnAID} 
                    className="border p-4 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all relative group"
                    onClick={() => handleLoanClick(loan)}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-md text-gray-800"><strong>Loan Amount:</strong> ₹{loan.LoanAmount}</p>
                    <p className="text-md text-gray-800"><strong>Installments:</strong> {loan.Installment}</p>
                    <p className="text-md text-gray-800"><strong>Start Date:</strong> {loan.StartDate ? new Date(loan.StartDate).toLocaleDateString() : '-'}</p>
                    <p className="text-md text-gray-800"><strong>Reason:</strong> {loan.Description || 'Not Available'}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${loan.IsApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {loan.IsApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <p className="text-md text-gray-800"><strong>Approved By:</strong>
                      {loan.IsApprovedByName || 'Not Available'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Edit Loan Modal */}
        {isEditModalOpen && selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-gray-800">Edit Loan</h2>
                </div>
                <button 
                  onClick={handleCloseEditModal}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Current Loan Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Loan Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-700"><strong>Selected Loan ID:</strong>{selectedLoan.LoanID}</p>
                    <p className="text-gray-700"><strong>Current Amount:</strong> ₹{selectedLoan.LoanAmount}</p>
                    <p className="text-gray-700"><strong>Current Installment:</strong> ₹{selectedLoan.Installment}</p>
                    <p className="text-gray-700"><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedLoan.IsApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {selectedLoan.IsApproved ? 'Approved' : 'Pending'}
                      </span>
                    </p>
                    <p className="text-gray-700"><strong>Start Date:</strong> {selectedLoan.StartDate ? new Date(selectedLoan.StartDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-gray-700 font-medium">Additional Amount (+ or -)</span>
                      <input
                        type="number"
                        value={editForm.additionalAmount}
                        onChange={(e) => setEditForm({ ...editForm, additionalAmount: e.target.value })}
                        placeholder="Enter amount to add/subtract"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {editForm.additionalAmount && !isNaN(parseFloat(editForm.additionalAmount)) ? (
                          <>
                            New Total: ₹{((parseFloat(selectedLoan.LoanAmount) || 0) + (parseFloat(editForm.additionalAmount) || 0)).toLocaleString()}
                            {parseFloat(editForm.additionalAmount) > 0 && <span className="text-green-600 ml-2">(+₹{parseFloat(editForm.additionalAmount).toLocaleString()})</span>}
                            {parseFloat(editForm.additionalAmount) < 0 && <span className="text-red-600 ml-2">(-₹{Math.abs(parseFloat(editForm.additionalAmount)).toLocaleString()})</span>}
                          </>
                        ) : 'Enter positive to increase, negative to decrease'}
                      </p>
                    </label>

                    <label className="block">
                      <span className="text-gray-700 font-medium">New Monthly Installment</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.monthlyInstallment}
                        onChange={(e) => setEditForm({ ...editForm, monthlyInstallment: e.target.value })}
                        placeholder="Enter new installment"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        New Period: {editPeriod === '' ? '-' : editPeriod} months
                      </p>
                    </label>
                  </div>

                  {/* Effective Date */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="block">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <Info className="w-4 h-4 text-yellow-600" />
                        Effective Date <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="date"
                        value={editForm.effectiveDate}
                        onChange={(e) => setEditForm({ ...editForm, effectiveDate: e.target.value })}
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Select the date when the updated loan terms should take effect. This will be the new start date for the modified loan.
                      </p>
                    </label>
                  </div>

                  {/* Calculation Summary */}
                  {(editForm.additionalAmount || editForm.monthlyInstallment) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-green-800 mb-2">Updated Calculation Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">New Total Amount</p>
                          <p className="text-lg font-bold text-gray-800">
                            ₹{((parseFloat(selectedLoan.LoanAmount) || 0) + (parseFloat(editForm.additionalAmount) || 0)).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly EMI</p>
                          <p className="text-lg font-bold text-gray-800">₹{parseFloat(editForm.monthlyInstallment).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Period</p>
                          <p className="text-lg font-bold text-gray-800">{editPeriod || '-'} months</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Effective From</p>
                          <p className="text-lg font-bold text-gray-800">
                            {editForm.effectiveDate ? new Date(editForm.effectiveDate).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reason Display */}
                  <div className="border-t pt-4">
                    <label className="block">
                      <span className="text-gray-700 font-medium">Original Reason</span>
                      <p className="mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {selectedLoan.Description || 'No reason provided'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={handleCloseEditModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLoan}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium shadow"
                >
                  Update Loan
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </>
  );
}

// Helper function to calculate EMI
const calculateEMI = (amount, term) => {
  if (!amount || !term || term <= 0) return 0;
  // Simple EMI calculation without interest (interest-free loan)
  return Math.ceil(amount / term);
};

// Helper function to format currency
const formatCurr = (value) => {
  if (!value) return '₹0';
  return `₹${parseFloat(value).toLocaleString('en-IN')}`;
};

export default LoanAdvanceManagement;