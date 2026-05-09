import React, { useState, useEffect } from 'react';
import useEmployeeStore from '../../../store/useEmployeeStore';
import { useThemeStore } from '../../../store';
import { getEmsStyles } from '../emsStyles';
import PermissionGuard from '../../../components/PermissionGuard';

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const MASTERS = [
  {
    key: 'departments',
    label: 'Departments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'positions',
    label: 'Positions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'types',
    label: 'Employee Types',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'branches',
    label: 'Branches',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const EmployeeList = ({ onAdd, onView, onEdit, onMaster }) => {
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);
  const { employees, locations, loading, error, fetchEmployees, toggleEmployeeStatus } = useEmployeeStore();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter((e) => {
    const name = `${e.FirstName} ${e.LastName || ''}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || (e.PhoneNumber || '').includes(search);
    const matchLocation = !locationFilter || String(e.LocationID) === locationFilter;
    const matchStatus = statusFilter === '' ? true : statusFilter === 'active' ? e.IsActive : !e.IsActive;
    return matchSearch && matchLocation && matchStatus;
  });

  const handleToggleStatus = async (e, emp) => {
    e.stopPropagation();
    if (!window.confirm(`${emp.IsActive ? 'Deactivate' : 'Activate'} ${emp.FirstName}?`)) return;
    try {
      await toggleEmployeeStatus(emp.EmpID);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.sectionCard}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={styles.stepTitle}>Employee Directory</h1>
          <p className={styles.stepSubtitle}>Manage and view all staff members across branches.</p>
        </div>
        <PermissionGuard permissions={['employee.create']}>
          <button onClick={onAdd} className={styles.btnPrimary}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Add Employee
          </button>
        </PermissionGuard>
      </div>

      {/* Masters quick-access */}
      {onMaster && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {MASTERS.map((m) => (
            <button
              key={m.key}
              onClick={() => onMaster(m.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 shadow-sm'
              }`}
            >
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex-1 min-w-[240px]">
          <label className={styles.label}>Search Employees</label>
          <input
            type="text"
            placeholder="Search name, phone or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input()}
          />
        </div>
        <div className="w-full sm:w-auto min-w-[180px]">
          <label className={styles.label}>Branch</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className={styles.select()}>
            <option value="">All Branches</option>
            {locations.map((l) => (
              <option key={l.LocationID} value={String(l.LocationID)}>{l.LocationName}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto min-w-[150px]">
          <label className={styles.label}>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.select()}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && <p className={styles.alertError + " mb-6"}>{error}</p>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="loading loading-spinner loading-lg text-blue-500 mb-4"></div>
          <p className={styles.textMuted}>Loading employee database...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-2xl">
            <div className="overflow-x-auto">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Code</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}>Phone</th>
                    <th className={styles.th}>Branch</th>
                    <th className={styles.th}>Joining Date</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th + " text-right"}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-24 text-center text-gray-400 italic">
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  ) : filtered.map((emp) => (
                    <tr
                      key={emp.EmpID}
                      className={`cursor-pointer ${styles.trHover}`}
                      onClick={() => onView(emp.EmpID)}
                    >
                      <td className={styles.td}><span className={styles.badge('gray')}>{emp.EmpID}</span></td>
                      <td className={styles.td}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                            {emp.FirstName[0]}{emp.LastName ? emp.LastName[0] : ''}
                          </div>
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{emp.FirstName} {emp.LastName || ''}</span>
                        </div>
                      </td>
                      <td className={styles.td}><span className="text-sm opacity-80">{emp.PhoneNumber || '—'}</span></td>
                      <td className={styles.td}>
                        <span className="text-sm opacity-80">
                          {locations.find((l) => l.LocationID === emp.LocationID)?.LocationName || '—'}
                        </span>
                      </td>
                      <td className={styles.td}><span className="text-sm opacity-80">{emp.DateOfJoining || '—'}</span></td>
                      <td className={styles.td}>
                        <span className={styles.badge(emp.IsActive ? 'green' : 'red')}>
                          {emp.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()} className={styles.td + " text-right"}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onView(emp.EmpID)}
                            className={styles.btnGhostSm(isDarkMode)}
                          >View</button>
                          <PermissionGuard permissions={['employee.update']}>
                            <button
                              onClick={() => onEdit(emp.EmpID)}
                              className={styles.btnOutlineSm(isDarkMode)}
                            >Edit</button>
                            <button
                              onClick={(e) => handleToggleStatus(e, emp)}
                              className={emp.IsActive ? styles.btnWarningSm : styles.btnSuccessSm}
                            >{emp.IsActive ? 'Deactivate' : 'Activate'}</button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
