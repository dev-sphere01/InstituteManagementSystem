import React, { useState } from 'react';

const AddCourse = ({ onCourseCreated, onCancel, loading }) => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    duration: '',
    level: 'beginner',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Code is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onCourseCreated(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow space-y-8 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Add New Course</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Code</label>
          <input name="code" value={form.code} onChange={handleChange} className="input input-bordered w-full" />
          {errors.code && <div className="text-red-500 text-xs mt-1">{errors.code}</div>}
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full" />
          {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
        </div>
        <div className="md:col-span-2">
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input input-bordered w-full min-h-[80px]" />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Duration</label>
          <input name="duration" value={form.duration} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Level</label>
          <select name="level" value={form.level} onChange={handleChange} className="input input-bordered w-full">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 md:col-span-2 mt-2">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          <label className="text-gray-700 dark:text-gray-200">Active</label>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting || loading ? 'Adding...' : 'Add Course'}
        </button>
      </div>
    </form>
  );
};

export default AddCourse;