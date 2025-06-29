import React, { useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const BasicInfo = ({ onNext, admissionId, initialData }) => {
  const notify = useNotification();
  const [form, setForm] = useState({
    formNo: '',
    centerCode: '',
    employeeId: '',
    generatedRegNo: '',
    fullName: '',
    dob: '',
    gender: '',
    category: '',
    aadharNo: '',
    religion: '',
    otherInfo: '',
    ...initialData
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!admissionId) {
        // Create admission
        const res = await API.post('/admission', form);
        notify('Basic Info saved successfully', 'success');
        onNext(form, res._id); // Pass newly created ID
      } else {
        // Update admission
        await API.put(`/admission/${admissionId}`, form);
        notify('Basic Info updated', 'info');
        onNext(form);
      }
    } catch (err) {
      notify(err?.response?.data?.message || 'Error saving Basic Info', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="formNo" value={form.formNo} onChange={handleChange} placeholder="Form No" required className="p-2 border rounded" />
        <input name="centerCode" value={form.centerCode} onChange={handleChange} placeholder="Center Code" required className="p-2 border rounded" />
        <input name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="Employee ID" required className="p-2 border rounded" />
        <input name="generatedRegNo" value={form.generatedRegNo} onChange={handleChange} placeholder="Generated Reg No" required className="p-2 border rounded" />
        <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" required className="p-2 border rounded" />
        <input type="date" name="dob" value={form.dob} onChange={handleChange} required className="p-2 border rounded" />
        <select name="gender" value={form.gender} onChange={handleChange} required className="p-2 border rounded">
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required className="p-2 border rounded" />
        <input name="aadharNo" value={form.aadharNo} onChange={handleChange} placeholder="Aadhar No" required className="p-2 border rounded" />
        <input name="religion" value={form.religion} onChange={handleChange} placeholder="Religion" required className="p-2 border rounded" />
      </div>
      <textarea name="otherInfo" value={form.otherInfo} onChange={handleChange} placeholder="Other Info" className="w-full p-2 border rounded" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {loading ? 'Saving...' : admissionId ? 'Update & Next' : 'Save & Next'}
      </button>
    </form>
  );
};

export default BasicInfo;
