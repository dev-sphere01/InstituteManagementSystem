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
  const show = (val) => (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) ? val : '-';

  // Render all available fields in a compact summary
  const renderSection = (title, obj) => (
    obj && typeof obj === 'object' ? (
      <div className="mb-4">
        <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">{title}</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {Object.entries(obj).map(([key, value]) => (
            <React.Fragment key={key}>
              <div className="font-semibold text-gray-600 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</div>
              <div>{Array.isArray(value) ? value.join(', ') : show(value)}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6 relative">
      {/* Go Back Button */}
      <button onClick={() => navigate(-1)} className="absolute top-4 right-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Go Back</button>
      <h2 className="text-xl font-bold mb-4">Enquiry Details</h2>
      {renderSection('Registration Info', enquiry.registrationInfo)}
      {renderSection('Personal Info', enquiry.personalInfo)}
      {renderSection('Contact Info', enquiry.contactInfo)}
      {renderSection('Education Info', enquiry.educationInfo)}
      {renderSection('Course Preferences', enquiry.coursePreferences)}
      {renderSection('Schedule Preferences', enquiry.schedulePreferences)}
      {renderSection('Referral Info', enquiry.referralInfo)}
      {renderSection('Goals & Requirements', enquiry.goalsRequirements)}
      {/* Show any other top-level fields not covered above */}
      <div className="mb-4">
        <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">Other Details</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {Object.entries(enquiry)
            .filter(([key]) => !['registrationInfo','personalInfo','contactInfo','educationInfo','coursePreferences','schedulePreferences','referralInfo','goalsRequirements'].includes(key))
            .map(([key, value]) => (
              <React.Fragment key={key}>
                <div className="font-semibold text-gray-600 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</div>
                <div>{Array.isArray(value) ? value.join(', ') : show(value)}</div>
              </React.Fragment>
            ))}
        </div>
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