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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Code</label>
        <input name="code" value={form.code} onChange={handleChange} className="input input-bordered w-full" />
        {errors.code && <div className="text-red-500 text-xs">{errors.code}</div>}
      </div>
      <div>
        <label className="block font-medium">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full" />
        {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block font-medium">Duration</label>
        <input name="duration" value={form.duration} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block font-medium">Level</label>
        <select name="level" value={form.level} onChange={handleChange} className="input input-bordered w-full">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
        <label>Active</label>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>Add Course</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default AddCourse;