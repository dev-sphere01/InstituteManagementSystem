import React, { useState } from 'react';
import API from '../../../../../../services/API';
import { useNotification } from '../../../../../../services/NotificationService';

const Header = ({ student, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const notify = useNotification();

  const statusColors = {
    Prospect: 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/40',
    Applied: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/40',
    Admitted: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-400/40',
    Active: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/40',
    Inactive: 'bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-400/40',
    Dropped: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-400/40',
    Completed: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/40',
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await API.admissions.updateLifecycleStatus(student._id, newStatus);
      notify(`Lifecycle status updated to "${newStatus}" successfully!`, 'success');
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to update student lifecycle status', err);
      notify(err.response?.data?.message || 'Failed to update student lifecycle status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white">
        <div className="flex justify-between items-start">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
            {student.fullName?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusColors[student.lifecycleStatus || 'Applied'] || 'bg-gray-500/20 text-gray-200 border border-gray-400/40'}`}>
              {student.lifecycleStatus || 'Applied'}
            </span>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-1 truncate">
          {student.fullName || "Student Name"}
        </h2>
        <p className="text-indigo-100 text-xs mb-3">
          ID: {student.generatedRegNo || student.formNo || 'N/A'}
        </p>

        {/* Manual Status Override Dropdown */}
        <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
          <label className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Lifecycle Status:</label>
          <select
            value={student.lifecycleStatus || 'Applied'}
            onChange={handleStatusChange}
            disabled={updating}
            className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer disabled:opacity-50"
          >
            {['Prospect', 'Applied', 'Admitted', 'Active', 'Inactive', 'Dropped', 'Completed'].map((status) => (
              <option key={status} value={status} className="text-slate-800 font-medium">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default Header;