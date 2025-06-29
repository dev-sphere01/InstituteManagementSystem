import React from 'react';

const Documents = () => {
  return (
    <div className="p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Document Uploads</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* File Inputs */}
        <div>
          <label className="block mb-1">Aadhar Photo</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        <div>
          <label className="block mb-1">Candidate Photo</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        <div>
          <label className="block mb-1">Candidate Signature</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        <div>
          <label className="block mb-1">Left Thumb Impression</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        {/* APAAR ID */}
        <div className="md:col-span-2">
          <label className="block mb-1">APAAR ID</label>
          <input type="text" placeholder="Enter APAAR ID" className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>

        {/* Marksheet Uploads */}
        <div>
          <label className="block mb-1">10th Marksheet</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        <div>
          <label className="block mb-1">12th Marksheet</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        <div>
          <label className="block mb-1">Ex-Servicemen Document</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        <div>
          <label className="block mb-1">Specially Abled Document</label>
          <input type="file" className="block w-full border rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        </div>

        {/* Specially Abled Other */}
        <div className="md:col-span-2">
          <label className="block mb-1">Specially Abled Other</label>
          <input type="text" placeholder="If applicable, specify..." className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
      </div>
    </div>
  );
};

export default Documents;
