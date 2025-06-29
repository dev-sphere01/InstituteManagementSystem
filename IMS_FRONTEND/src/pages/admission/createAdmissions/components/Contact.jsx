import React, { useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const Contact = ({ onNext, admissionId, initialData }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    contactNumber: '',
    alternateContactNumber: '',
    emailAddress: '',
    state: '',
    district: '',
    address: '',
    pinCode: '',
    fathersName: '',
    fathersOccupation: '',
    fathersJobRole: '',
    departmentOrCompany: '',
    mothersName: '',
    guardianName: '',
    guardianRelation: '',
    guardianContactNumber: '',
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
      notify('Contact details updated successfully', 'success');
      onNext(form);
    } catch (err) {
      notify(err?.response?.data?.message || 'Error updating contact info', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" required className="p-2 border rounded" />
        <input name="alternateContactNumber" value={form.alternateContactNumber} onChange={handleChange} placeholder="Alternate Contact Number" className="p-2 border rounded" />
        <input name="emailAddress" value={form.emailAddress} onChange={handleChange} placeholder="Email Address" required className="p-2 border rounded" />
        <input name="state" value={form.state} onChange={handleChange} placeholder="State" required className="p-2 border rounded" />
        <input name="district" value={form.district} onChange={handleChange} placeholder="District" required className="p-2 border rounded" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Full Address" required className="p-2 border rounded" />
        <input name="pinCode" value={form.pinCode} onChange={handleChange} placeholder="Pin Code" required className="p-2 border rounded" />
        <input name="fathersName" value={form.fathersName} onChange={handleChange} placeholder="Father's Name" required className="p-2 border rounded" />
        <input name="fathersOccupation" value={form.fathersOccupation} onChange={handleChange} placeholder="Father's Occupation" required className="p-2 border rounded" />
        <input name="fathersJobRole" value={form.fathersJobRole} onChange={handleChange} placeholder="Father's Job Role" className="p-2 border rounded" />
        <input name="departmentOrCompany" value={form.departmentOrCompany} onChange={handleChange} placeholder="Department/Company" className="p-2 border rounded" />
        <input name="mothersName" value={form.mothersName} onChange={handleChange} placeholder="Mother's Name" required className="p-2 border rounded" />
        <input name="guardianName" value={form.guardianName} onChange={handleChange} placeholder="Guardian Name" className="p-2 border rounded" />
        <input name="guardianRelation" value={form.guardianRelation} onChange={handleChange} placeholder="Guardian Relation" className="p-2 border rounded" />
        <input name="guardianContactNumber" value={form.guardianContactNumber} onChange={handleChange} placeholder="Guardian Contact Number" className="p-2 border rounded" />
      </div>

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {loading ? 'Saving...' : 'Save & Next'}
      </button>
    </form>
  );
};

export default Contact;
