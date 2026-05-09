import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import useEmployeeStore from '../../../store/useEmployeeStore';

const EMPTY_FORM = { LocationName: '' };

const Branches = ({ onBack }) => {
  const { isDarkMode } = useThemeStore();
  const s = getEmsStyles(isDarkMode);
  const { locations, fetchLocations, createLocation, updateLocation, deleteLocation } = useEmployeeStore();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchLocations(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (loc) => {
    setEditTarget(loc);
    setForm({ LocationName: loc.LocationName || '' });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.LocationName.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editTarget) {
        await updateLocation(editTarget.LocationID, form);
      } else {
        await createLocation(form);
      }
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to save.';
      setError(typeof msg === 'string' ? msg : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loc) => {
    if (!window.confirm(`Delete branch "${loc.LocationName}"? This cannot be undone.`)) return;
    try {
      await deleteLocation(loc.LocationID);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete.';
      alert(typeof msg === 'string' ? msg : 'Failed to delete.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Branch Master</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage branch / location names used across the EMS.
            </p>
          </div>
        </div>
        <button onClick={openAdd} className={s.btnPrimary}>+ Add Branch</button>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={`${s.th} w-12`}>#</th>
              <th className={s.th}>Branch / Location Name</th>
              <th className={`${s.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={3} className={`${s.td} text-center py-16 text-gray-400 italic`}>
                  No branches configured. Click "Add Branch" to create one.
                </td>
              </tr>
            ) : locations.map((loc, i) => (
              <tr key={loc.LocationID} className={s.trHover}>
                <td className={`${s.td} text-gray-400 text-sm`}>{i + 1}</td>
                <td className={`${s.td} font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {loc.LocationName}
                </td>
                <td className={`${s.td} text-right`}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(loc)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                        isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(loc)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                        isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-500 hover:bg-red-50'
                      }`}
                    >Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className={s.modalOverlay}>
          <div className={s.modalBox}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={s.modalTitle}>
                {editTarget ? 'Edit Branch' : 'Add Branch'}
              </h3>
              <button
                onClick={closeModal}
                className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {error && <p className={s.alertError}>{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={s.label}>
                  Branch / Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={s.input()}
                  value={form.LocationName}
                  onChange={(e) => setForm({ LocationName: e.target.value })}
                  placeholder="e.g. Main Campus, North Branch"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className={s.btnGhost(isDarkMode)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={s.btnPrimary}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : editTarget ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
