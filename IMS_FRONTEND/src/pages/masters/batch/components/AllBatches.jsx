import React from 'react';
import { useThemeStore } from '../../../../store';

const AllBatches = ({ batches, onEditBatch, onDeleteBatch }) => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Batches</h2>
      {batches.length === 0 ? (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No batches found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full table-auto border-collapse ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            <thead>
              <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <th className="px-4 py-2 text-left">Centre Code</th>
                <th className="px-4 py-2 text-left">Batch Timing</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Course</th>
                <th className="px-4 py-2 text-left">Teacher Name</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, idx) => (
                <tr key={batch._id} className={idx % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')}>
                  <td className="px-4 py-2 whitespace-nowrap">{batch.centreCode}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{batch.batchTiming}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{batch.subject}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{batch.course}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{batch.teacherName}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="inline-flex items-center px-3 py-1 mr-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow"
                      onClick={() => onEditBatch(batch)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this batch?')) onDeleteBatch(batch._id);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllBatches;