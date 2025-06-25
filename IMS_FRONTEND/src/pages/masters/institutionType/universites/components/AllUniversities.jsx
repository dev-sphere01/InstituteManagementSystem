import React from 'react';
import {useThemeStore} from '../../../../../store';

const AllUniversities = ({ universities, onEditUniversity, onDeleteUniversity, loading, error }) => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`rounded-md p-6 shadow-md border ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-300'}`}>
      <h2 className="text-lg font-semibold mb-4">All Universities</h2>

      {loading ? (
        <p className="text-sm">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : universities.length === 0 ? (
        <p className="text-sm text-gray-500">No universities found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">University Name</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((university, index) => (
                <tr
                  key={university._id}
                  className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{university.universityName}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => onEditUniversity(university)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteUniversity(university._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
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

export default AllUniversities;
