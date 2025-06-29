import React, { useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const Education = ({ onNext, admissionId, initialData }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    highestEducationalQualification: '',
    boardOrUniversity: '',
    yearOfPassing: '',
    subjectsStudied: '',
    courseApplied: '',
    preferredModeOfLearning: '',
    ...initialData
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!admissionId) return notify('Admission ID missing', 'error');
    setLoading(true);

    try {
      await API.put(`/admission/${admissionId}`, form);
      notify('Education & Course details saved', 'success');
      onNext(form);
    } catch (err) {
      notify(err?.response?.data?.message || 'Error saving education info', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="highestEducationalQualification"
          value={form.highestEducationalQualification}
          onChange={handleChange}
          placeholder="Highest Qualification"
          required
          className="p-2 border rounded"
        />
        <input
          name="boardOrUniversity"
          value={form.boardOrUniversity}
          onChange={handleChange}
          placeholder="Board/University"
          required
          className="p-2 border rounded"
        />
        <input
          name="yearOfPassing"
          value={form.yearOfPassing}
          onChange={handleChange}
          placeholder="Year of Passing"
          required
          className="p-2 border rounded"
        />
        <input
          name="subjectsStudied"
          value={form.subjectsStudied}
          onChange={handleChange}
          placeholder="Subjects Studied"
          required
          className="p-2 border rounded"
        />
        <input
          name="courseApplied"
          value={form.courseApplied}
          onChange={handleChange}
          placeholder="Course Applied"
          required
          className="p-2 border rounded"
        />
        <select
          name="preferredModeOfLearning"
          value={form.preferredModeOfLearning}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        >
          <option value="">Select Mode of Learning</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {loading ? 'Saving...' : 'Save & Next'}
      </button>
    </form>
  );
};

export default Education;
