import React, { useEffect } from 'react';
import useEnquiryStore from '../../../../store/useEnquiryStore';

const EnquiryTable = () => {
  const { enquiries, loading, error, fetchEnquiries, filters, setFilters } = useEnquiryStore();

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line
  }, [filters]);

  // Ensure enquiries is always an array
  const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];

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
        {/* Add more filters here as needed */}
      </div>
      {loading ? (
        <div className="text-center py-8">Loading enquiries...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
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
                  <td colSpan={4} className="text-center py-8 text-gray-400">No enquiries found.</td>
                </tr>
              ) : (
                safeEnquiries.map(enq => (
                  <tr key={enq._id}>
                    <td className="px-4 py-2">{enq.personalInfo?.fullName}</td>
                    <td className="px-4 py-2">{enq.contactInfo?.contactNumber}</td>
                    <td className="px-4 py-2">{enq.coursePreferences?.interestedCourses?.join(', ')}</td>
                    <td className="px-4 py-2">{new Date(enq.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnquiryTable;