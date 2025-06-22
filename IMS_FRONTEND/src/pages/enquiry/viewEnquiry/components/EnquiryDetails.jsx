import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const EnquiryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const enquiry = location.state?.enquiry;

  if (!enquiry) {
    return (
      <div className="p-6 text-center text-red-500">No enquiry data found. <button className="ml-2 underline" onClick={() => navigate(-1)}>Go Back</button></div>
    );
  }

  // Helper to show fallback for missing/empty
  const show = (val) => (val && val.length !== 0 ? val : '-');

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6 relative">
      {/* Go Back Button */}
      <button onClick={() => navigate(-1)} className="absolute top-4 right-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Go Back</button>
      <h2 className="text-xl font-bold mb-4">Enquiry Details</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div className="font-semibold text-gray-600 dark:text-gray-300">Full Name:</div>
        <div>{show(enquiry.personalInfo?.fullName)}</div>
        <div className="font-semibold text-gray-600 dark:text-gray-300">Contact Number:</div>
        <div>{show(enquiry.contactInfo?.contactNumber)}</div>
        <div className="font-semibold text-gray-600 dark:text-gray-300">Email:</div>
        <div>{show(enquiry.contactInfo?.email)}</div>
        <div className="font-semibold text-gray-600 dark:text-gray-300">Course(s) Interested:</div>
        <div>{show(enquiry.coursePreferences?.interestedCourses?.join(', '))}</div>
        <div className="font-semibold text-gray-600 dark:text-gray-300">Date of Enquiry:</div>
        <div>{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : '-'}</div>
        <div className="font-semibold text-gray-600 dark:text-gray-300">Status:</div>
        <div>{show(enquiry.status)}</div>
        {/* Add more fields as needed */}
      </div>
      <div className="flex gap-4 mt-8 justify-end">
        {enquiry.status !== 'completed' && (
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => {/* TODO: Mark as completed API call */}}>Mark as Completed</button>
        )}
        {enquiry.status !== 'closed' && (
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => {/* TODO: Mark as closed API call */}}>Close Enquiry</button>
        )}
      </div>
    </div>
  )
}

export default EnquiryDetails