import React from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const Review = ({ admissionId, admissionData, onSubmitFinal }) => {
  const notify = useNotification();

  const handleSubmit = async () => {
    try {
      await API.put(`/admission/${admissionId}`, {
        ...admissionData,
        status: 'Submitted',
      });
      notify('Admission submitted successfully', 'success');
      if (onSubmitFinal) onSubmitFinal();
    } catch (err) {
      notify(err?.response?.data?.message || 'Submission failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Review & Submit</h2>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-2">Basic Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Name:</strong> {admissionData.fullName}</div>
          <div><strong>DOB:</strong> {admissionData.dob}</div>
          <div><strong>Gender:</strong> {admissionData.gender}</div>
          <div><strong>Category:</strong> {admissionData.category}</div>
          <div><strong>Aadhar No:</strong> {admissionData.aadharNo}</div>
          <div><strong>Religion:</strong> {admissionData.religion}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-2">Contact</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Phone:</strong> {admissionData.contactNumber}</div>
          <div><strong>Email:</strong> {admissionData.emailAddress}</div>
          <div><strong>State:</strong> {admissionData.state}</div>
          <div><strong>District:</strong> {admissionData.district}</div>
          <div><strong>Address:</strong> {admissionData.address}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-2">Education</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Qualification:</strong> {admissionData.highestEducationalQualification}</div>
          <div><strong>Board:</strong> {admissionData.boardOrUniversity}</div>
          <div><strong>Year:</strong> {admissionData.yearOfPassing}</div>
          <div><strong>Subjects:</strong> {admissionData.subjectsStudied}</div>
          <div><strong>Course:</strong> {admissionData.courseApplied}</div>
          <div><strong>Mode:</strong> {admissionData.preferredModeOfLearning}</div>
        </div>
      </div>

      {/* You can optionally add preview of base64 files if needed */}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Confirm & Submit
      </button>
    </div>
  );
};

export default Review;
