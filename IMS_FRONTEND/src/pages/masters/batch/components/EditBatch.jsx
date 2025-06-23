import React, { useState } from 'react';
import { useThemeStore } from '../../../../store';

const EditBatch = ({ batch, onBatchUpdated, onClose }) => {
  const { isDarkMode } = useThemeStore();
  const [form, setForm] = useState(batch);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.centreCode.trim()) errs.centreCode = 'Centre code is required';
    if (!form.batchTiming.trim()) errs.batchTiming = 'Batch timing is required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.course.trim()) errs.course = 'Course is required';
    if (!form.teacherName.trim()) errs.teacherName = 'Teacher name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onBatchUpdated(form);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-w-2xl mx-auto`}>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Batch</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Centre Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="centreCode"
              value={form.centreCode}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.centreCode ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Enter centre code"
            />
            {errors.centreCode && <p className="mt-1 text-sm text-red-500">{errors.centreCode}</p>}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Batch Timing <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="batchTiming"
              value={form.batchTiming}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.batchTiming ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="e.g. 9:00 AM - 11:00 AM"
            />
            {errors.batchTiming && <p className="mt-1 text-sm text-red-500">{errors.batchTiming}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.subject ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Enter subject"
            />
            {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Course <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="course"
              value={form.course}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.course ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Enter course"
            />
            {errors.course && <p className="mt-1 text-sm text-red-500">{errors.course}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Teacher Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="teacherName"
              value={form.teacherName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.teacherName ? 'border-red-500' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Enter teacher name"
            />
            {errors.teacherName && <p className="mt-1 text-sm text-red-500">{errors.teacherName}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBatch;