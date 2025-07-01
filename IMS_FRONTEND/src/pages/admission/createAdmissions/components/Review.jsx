import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';
import { useNotification } from '../../../../services/NotificationService';
import API from '../../../../services/api';

const Review = ({ formData = {}, onBack, onFinish }) => {
  const { isDarkMode } = useThemeStore();
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData?._id) {
      notify('Form ID is missing. Cannot submit.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await API.put(`/admissions/${formData._id}`, {
        ...formData,
        currentStep: 'review',
        status: 'submitted',
      });

      notify('Form submitted successfully!', 'success');
      if (typeof onFinish === 'function') {
        onFinish();
      }
    } catch (err) {
      console.error('Submission error:', err);
      notify('Failed to submit the form.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const sectionClass = 'mb-6 border-b border-gray-300 pb-4';
  const labelClass = 'font-semibold text-sm text-gray-600';
  const valueClass = 'text-base text-gray-900 dark:text-gray-200';

  const renderField = (label, value) => (
    <div className="mb-2">
      <div className={labelClass}>{label}</div>
      <div className={valueClass}>{value || '—'}</div>
    </div>
  );

  return (
    <div
      className={`w-full mt-8 rounded-2xl shadow-lg p-8 mx-auto ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 text-white'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200 text-gray-900'
      }`}
    >
      <h2 className="text-2xl font-bold mb-8 tracking-tight">Step 5: Review & Submit</h2>

      {/* Sections */}
      <div className={sectionClass}>
        <h3 className="text-lg font-bold mb-3">Contact Information</h3>
        {renderField('Name', `${formData.firstName} ${formData.lastName}`)}
        {renderField('Contact Number', formData.contactNumber)}
        {renderField('Email Address', formData.emailAddress)}
        {renderField('Address', formData.address)}
        {renderField('State', formData.state)}
        {renderField('District', formData.district)}
        {renderField('Pin Code', formData.pinCode)}
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-bold mb-3">Education</h3>
        {renderField('Qualification', formData.highestEducationalQualification)}
        {renderField('Board/University', formData.boardOrUniversity)}
        {renderField('Year of Passing', formData.yearOfPassing)}
        {renderField('Subjects', Array.isArray(formData.subjectsStudied) ? formData.subjectsStudied.join(', ') : formData.subjectsStudied)}
        {renderField('Course Applied', formData.courseApplied)}
        {renderField('Mode of Learning', formData.preferredModeOfLearning)}
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-bold mb-3">Features</h3>
        {[
          'tShirt',
          'itTools',
          'webDesigning',
          'tally',
          'gfxDtp',
          'python',
          'iot',
        ].map((feature) => renderField(feature, formData[feature] ? 'Yes' : 'No'))}
      </div>

      <div className={sectionClass}>
        <h3 className="text-lg font-bold mb-3">Computer Access & Referral</h3>
        {renderField('Access Location', formData.computerAccessOther)}
        {renderField('Referral Source', formData.referralSource)}
        {renderField('Referral Other', formData.referralSourceOther)}
        {renderField('Referral Name', formData.referalName)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-8 border-t mt-8 border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isDarkMode
              ? 'border border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white'
              : 'border border-gray-300 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-900'
          }`}
          disabled={submitting}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-6 py-2 rounded-lg shadow font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            submitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default Review;
