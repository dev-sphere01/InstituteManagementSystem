import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { notification } from '@/services';
import HolidaysService from '@/services/Leaves/holidaysService';
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";

const Holidays = () => {
  const notify = notification();
  const [allHolidays, setAllHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    holidayName: '',
    date: '',
  });

  const [importData, setImportData] = useState({
    year: currentYear,
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const data = await HolidaysService.getAllHolidays();
      setAllHolidays(data || []);
      setCurrentPage(1);
    } catch (error) {
      notify.error('Failed to load holidays');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHolidays = useMemo(() => {
    return allHolidays.filter(h => h.Year === parseInt(selectedYear));
  }, [allHolidays, selectedYear]);

  const paginatedHolidays = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHolidays.slice(start, start + itemsPerPage);
  }, [filteredHolidays, currentPage]);

  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);

  const availableYears = useMemo(() => {
    const years = new Set(allHolidays.map(h => h.Year));
    return Array.from(years).sort((a, b) => b - a);
  }, [allHolidays]);

  useEffect(() => {
    fetchHolidays();
  }, []);

  //permissions
  const canRead = hasPermission('leave_management.holiday_entry.read')
  const canCreate = hasPermission('leave_management.holiday_entry.create')
  const canUpdate = hasPermission('leave_management.holiday_entry.update')
  const canDelete = hasPermission('leave_management.holiday_entry.delete')


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImportChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setImportData(prev => ({
        ...prev,
        file: files?.[0] || null
      }));
    } else {
      setImportData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setImportError('');
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();

    if (!formData.holidayName.trim()) {
      notify.error('Please enter a holiday name');
      return;
    }

    if (!formData.date) {
      notify.error('Please select a date');
      return;
    }

    try {
      setIsSubmitting(true);
      const date = new Date(formData.date);
      const year = date.getFullYear();

      await HolidaysService.createHoliday(formData.holidayName, date, year);
      notify.success('Holiday created successfully');

      setFormData({ holidayName: '', date: '' });
      await fetchHolidays();
    } catch (error) {
      notify.error('Failed to create holiday');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportHolidays = async (e) => {
    e.preventDefault();

    if (!importData.file) {
      setImportError('Please select an Excel file');
      return;
    }

    if (!importData.year) {
      setImportError('Please select a year');
      return;
    }

    try {
      setIsImporting(true);
      setImportError('');

      const result = await HolidaysService.importHolidays(importData.file, parseInt(importData.year));

      if (result?.Message) {
        notify.success(result.Message);
        setImportData({ year: currentYear, file: null });
        const fileInput = document.getElementById('excelFile');
        if (fileInput) fileInput.value = '';
        await fetchHolidays();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to import holidays';
      setImportError(errorMsg);
      notify.error(errorMsg);
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await HolidaysService.deleteHoliday(id);
      notify.success('Holiday deleted successfully');
      setDeleteConfirm(null);
      await fetchHolidays();
    } catch (error) {
      notify.error('Failed to delete holiday');
      console.error(error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN');
    } catch {
      return '-';
    }
  };

  if (!canRead) {
    return (
      <div>Access Denied</div>
    )
  }

  return (
    <div className="h-full bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 py-3"
      >
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-800">Holiday Management</h1>
        </div>

        {/* Main Layout - Forms and Table in same row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {canCreate && <>
            {/* Left Column - Forms */}
            <div className="lg:col-span-1 space-y-4">
              {/* Create Holiday Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-semibold text-gray-800">Add Holiday</h3>
                </div>

                <form onSubmit={handleCreateHoliday} className="flex flex-col h-full">
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="holidayName"
                        value={formData.holidayName}
                        onChange={handleFormChange}
                        placeholder="Holiday name"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 self-end bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-1.5 px-3 text-xs rounded transition duration-200 flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </form>


              </motion.div>

              {/* Import Excel Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-4 h-4 text-green-600" />
                  <h3 className="text-xs font-semibold text-gray-800">Import Excel</h3>
                </div>

                <form onSubmit={handleImportHolidays} className="flex flex-col h-full">
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={importData.year}
                        onChange={handleImportChange}
                        min="2000"
                        max={currentYear + 5}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        disabled={isImporting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        File
                      </label>
                      <input
                        id="excelFile"
                        type="file"
                        name="file"
                        onChange={handleImportChange}
                        accept=".xlsx,.xls,.csv"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        disabled={isImporting}
                      />
                    </div>

                    {importError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
                        <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{importError}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isImporting}
                    className="mt-4 self-end bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-1.5 px-3 text-xs rounded transition duration-200 flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <Upload className="w-3 h-3" />
                    {isImporting ? 'Importing...' : 'Import'}
                  </button>
                </form>
              </motion.div>
            </div>
          </>}


          {/* Right Column - Holidays Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col"
          >
            {/* Table Header with Year Filter */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Holidays ({filteredHolidays.length})
                </h3>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {availableYears.length === 0 ? (
                    <option value={currentYear}>{currentYear}</option>
                  ) : (
                    availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="text-xs text-gray-600">
                Page {currentPage} of {Math.max(1, totalPages)}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Holiday Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Date
                    </th>
                    {canDelete &&
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                        Action
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-xs text-gray-600">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedHolidays.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-xs text-gray-500">
                        No holidays for {selectedYear}
                      </td>
                    </tr>
                  ) : (
                    paginatedHolidays.map((holiday) => (
                      <tr
                        key={holiday.HID}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2.5 text-xs text-gray-800">
                          {holiday.HolidayName}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-800">
                          {formatDate(holiday.Date)}
                        </td>
                        {canDelete && <>
                          <td className="px-4 py-2.5 text-center">
                            {deleteConfirm === holiday.HID ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleDeleteHoliday(holiday.HID)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-medium rounded transition"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(holiday.HID)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-xs font-medium"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            )}
                          </td>
                        </>}

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 text-xs font-medium rounded transition ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Holidays;
