import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { API, notification, TableService } from '@/services';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PayrollService from '@/services/Payroll/payrollService';
import formatCurrency from '@/utils/formatCurrency';
import formatDateTime from '@/utils/DateTimeFormat';
import { FaClipboardList, FaMoneyBill } from 'react-icons/fa';
import { BadgePlus, Info } from 'lucide-react';

const Penalty = () => {
  const notify = notification();

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Penalty form state
  const initialFormState = {
    amount: '',
    description: '',
    deductionDate: ''
  };
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Table data
  const [penalties, setPenalties] = useState([]);
  const tableRef = useRef(null);

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
        return;
      }
      try {
        const list = await PayrollService.getEmployeesByDepartment(deptId);
        setEmployees(Array.isArray(list) ? list : []);
        setSelectedEmpId('');
      } catch (err) {
        console.error('Failed to load employees', err);
        // notify.error('Failed to load employees');
      }
    };
    loadEmployees();
  }, [deptId]);

  // Load all penalties
  const fetchPenalties = async () => {
    try {
      // Using absolute URL as requested
      const res = await API.get('/Penalties');
      const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      setPenalties(data);
    } catch (err) {
      console.error('Failed to load penalties', err);
      notify.error('Failed to load penalties');
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const displayedPenalties = useMemo(() => {
    if (!selectedEmpId) return penalties;
    const id = Number(selectedEmpId);
    return penalties.filter((p) => Number(p.EmpID) === id);
  }, [penalties, selectedEmpId]);

  const columns = useMemo(
    () => [
      { accessorKey: 'PID', header: 'ID' },
      { accessorKey: 'EmpID', header: 'Emp ID' },
      {
        accessorKey: 'Amount',
        header: 'Amount',
        cell: (info) => formatCurrency(Number(info.getValue() || 0), true),
      },
      { accessorKey: 'Description', header: 'Description' },
      {
        accessorKey: 'DeductionDate',
        header: 'Deduction Date',
        cell: (info) => (info.getValue() ? formatDateTime(info.getValue(), 'dd-MM-yyyy') : '-')
      },
      {
        accessorKey: 'CreatedAt',
        header: 'Created',
        cell: (info) => (info.getValue() ? formatDateTime(info.getValue(), 'dd-MM-yyyy HH:mm') : '-')
      },
    ], []
  );

  const isFormDisabled = !selectedEmpId;

  const handleSubmit = async () => {
    // Basic validations
    const amount = parseFloat(form.amount);
    if (!deptId) return notify.error('Please select a department');
    if (!selectedEmpId) return notify.error('Please select an employee');
    if (!amount || amount <= 0) return notify.error('Enter a valid amount');
    if (!form.description?.trim()) return notify.error('Please enter a description');
    if (!form.deductionDate) return notify.error('Please select a deduction date');

    const deduction = new Date(form.deductionDate);

    const payload = {
      PID: 0,
      EmpID: parseInt(selectedEmpId),
      Amount: amount,
      Description: form.description.trim(),
      DeductionDate: deduction.toISOString(),
      CreatedAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      // Using absolute URL as requested
      await API.post('/Penalties', payload);
      notify.success('Penalty added successfully!');
      setForm(initialFormState);
      // Refresh list
      await fetchPenalties();
    } catch (error) {
      console.error('Submission failed:', error);
      notify.error('There was an error submitting the penalty.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-5 bg-gradient-to-br from-gray-100 to-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <FaMoneyBill className="text-red-600" /> Penalties
      </h1>

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
                  {emp.FirstName} {emp.LastName} - {emp.EmpID}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Create Penalty Form */}
        <div className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BadgePlus className="text-red-700 w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-800">Create New Penalty</h2>
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
              <span className="text-gray-700">Description</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter description"
                disabled={isFormDisabled}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Deduction Date</span>
              <input
                type="date"
                value={form.deductionDate}
                onChange={(e) => setForm({ ...form, deductionDate: e.target.value })}
                placeholder="Select deduction date"
                disabled={isFormDisabled}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isFormDisabled || submitting}
            className="mt-6 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium px-6 py-2 rounded shadow"
          >
            {submitting ? 'Submitting...' : 'Add Penalty'}
          </button>

          <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Only active employees within the selected department are listed.
          </div>
        </div>

        {/* Right panel info (optional placeholder) */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-lg p-6 rounded-lg transition hover:shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaMoneyBill className="text-red-600" />
            <h2 className="text-lg font-semibold text-gray-800">Penalty Notes</h2>
          </div>
          <ul className="list-disc text-sm text-gray-600 ml-6 space-y-1">
            <li>Provide a clear reason for the deduction for audit purposes.</li>
            <li>Double-check the deduction date to fall within the payroll cycle.</li>
          </ul>
        </motion.section>
      </div>

      {/* Table of Penalties */}
      <div className="bg-white shadow-lg p-6 rounded-lg mt-8">
        <div className="flex items-center gap-2 mb-4">
          <FaClipboardList className="text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">Penalty Entries</h2>
        </div>

        <TableService
          ref={tableRef}
          columns={columns}
          data={displayedPenalties}
          initialPageSize={10}
          serverPagination={false}
        />
      </div>
    </div>
  );
};

export default Penalty;
