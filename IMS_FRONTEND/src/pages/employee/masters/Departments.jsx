import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import useEmployeeStore from '../../../store/useEmployeeStore';

const Departments = ({ onBack }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const navigate = useNavigate();
  const { departments, fetchDepartments, createDepartment, updateDepartment, deleteDepartment } = useEmployeeStore();

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ DeptName: '', Description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setForm({ DeptName: '', Description: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setForm({ DeptName: dept.DeptName, Description: dept.Description || '' });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        alert(err.message || 'Failed to delete department.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.DeptName.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editingDept) {
        const id = editingDept.DeptID || editingDept._id;
        await updateDepartment(id, form);
      } else {
        await createDepartment(form);
      }
      setForm({ DeptName: '', Description: '' });
      setShowModal(false);
      setEditingDept(null);
    } catch (err) {
      setError(err.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateToTickets = (deptName) => {
    navigate(`/dashboard/tickets?department=${encodeURIComponent(deptName)}`);
  };

  return (
    <div className={styles.sectionCard}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className={styles.stepTitle}>Departments Master</h2>
          </div>
          <p className={styles.stepSubtitle}>
            Manage organizational departments and divisions for employee & ticket assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/tickets')}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition flex items-center gap-1.5"
          >
            <span>🎫</span>
            <span>View All Tickets</span>
          </button>
          <button onClick={openCreateModal} className={styles.btnPrimary}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Department
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th + ' w-16'}>#</th>
              <th className={styles.th}>Department Name</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th + ' text-right pr-6'}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-gray-400 italic">
                  No departments configured yet. Click "Add Department" to create one.
                </td>
              </tr>
            ) : (
              departments.map((d, i) => (
                <tr key={d.DeptID || d._id || i} className={styles.trHover}>
                  <td className={styles.td}>
                    <span className={styles.badge('gray')}>{i + 1}</span>
                  </td>
                  <td className={`${styles.td} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span>{d.DeptName}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className="text-sm opacity-70">
                      {d.Description || 'No description provided'}
                    </span>
                  </td>
                  <td className={styles.td + ' text-right pr-6'}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleNavigateToTickets(d.DeptName)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 hover:bg-indigo-100 transition"
                        title="View department tickets"
                      >
                        🎫 Tasks & Tickets
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(d)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Edit Department"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(d.DeptID || d._id, d.DeptName)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Delete Department"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={styles.modalTitle}>
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {error && <div className={styles.alertError + ' mb-6'}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={styles.label}>
                  Department Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  className={styles.input()}
                  value={form.DeptName}
                  onChange={(e) => setForm((f) => ({ ...f, DeptName: e.target.value }))}
                  placeholder="e.g. Information Technology, Admissions, Accounts"
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.input() + ' min-h-[100px] resize-none'}
                  value={form.Description}
                  onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))}
                  placeholder="What does this department handle?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.btnGhost(isDarkMode)}
                >
                  Discard
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2" /> Saving...
                    </>
                  ) : editingDept ? (
                    'Update Department'
                  ) : (
                    'Create Department'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
