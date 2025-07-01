import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useEnquiryStore from '../../../../store/useEnquiryStore';

const EnquiryTable = () => {
  const storeInstance = useEnquiryStore;
  const {
    enquiries,
    loading,
    error,
    fetchEnquiries,
    filters,
    setFilters,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    total
  } = useEnquiryStore();
  const navigate = useNavigate();

  // Debounce fetch to avoid race conditions
  const debounceRef = useRef();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchEnquiries();
    }, 200);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line
  }, [filters.search, page, limit]);

  const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];
  console.log('Table rendering enquiries:', safeEnquiries);
  console.log('Zustand store instance:', storeInstance);

  // Helper to show fallback for missing/empty
  const show = (val) => (val && val.length !== 0 ? val : '-');

  // Calculate serial number for current page
  const getSerial = (idx) => (page - 1) * limit + idx + 1;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name or contact..."
          value={filters.search}
          onChange={e => setFilters({ search: e.target.value })}
          className="border px-3 py-2 rounded w-64 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={() => {
            fetchEnquiries();
            setTimeout(() => {
              console.log('Manual refresh, enquiries:', useEnquiryStore.getState().enquiries);
            }, 500);
          }}
          className="ml-2 px-3 py-2 bg-blue-500 text-white rounded"
        >
          Refresh
        </button>
        {/* Add more filters here as needed */}
      </div>
      {loading ? (
        <div className="text-center py-8">Loading enquiries...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                {/* Add more columns as needed */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {safeEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No enquiries found.</td>
                </tr>
              ) : (
                safeEnquiries.map((enq, idx) => (
                  <tr key={enq._id} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700" onClick={() => navigate(`/dashboard/enquiry/details/${enq._id}`, { state: { enquiry: enq } })}>
                    <td className="px-4 py-2">{getSerial(idx)}</td>
                    <td className="px-4 py-2">{show(enq.personalInfo?.fullName)}</td>
                    <td className="px-4 py-2">{show(enq.contactInfo?.contactNumber)}</td>
                    <td className="px-4 py-2">{show((enq.coursePreferences?.interestedCourses && enq.coursePreferences.interestedCourses.length > 0) ? enq.coursePreferences.interestedCourses.join(', ') : '')}</td>
                    <td className="px-4 py-2">{enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing page {page} of {totalPages} ({total} enquiries)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="ml-2 px-2 py-1 rounded border bg-gray-100 dark:bg-gray-700"
            >
              {[10, 20, 50, 100].map(opt => (
                <option key={opt} value={opt}>{opt} / page</option>
              ))}
            </select>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default EnquiryTable;