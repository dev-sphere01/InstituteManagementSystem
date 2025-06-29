import React, { useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';

const Documents = ({ onNext, admissionId, initialData }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    aadharPhoto: '',
    candidatePhoto: '',
    candidateSignature: '',
    candidateLeftThumbImpression: '',
    apaarId: '',
    tenthMarksheet: '',
    twelfthMarksheet: '',
    exServicemen: '',
    speciallyAbled: '',
    speciallyAbledOther: '',
    ...initialData
  });

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admissionId) return notify('Admission ID missing', 'error');
    setLoading(true);

    try {
      await API.put(`/admission/${admissionId}`, form);
      notify('Documents saved successfully', 'success');
      onNext(form);
    } catch (err) {
      notify(err?.response?.data?.message || 'Error saving documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          Aadhar Photo:
          <input type="file" name="aadharPhoto" accept="image/*" onChange={handleFileChange} />
        </label>
        <label className="block">
          Candidate Photo:
          <input type="file" name="candidatePhoto" accept="image/*" onChange={handleFileChange} />
        </label>
        <label className="block">
          Candidate Signature:
          <input type="file" name="candidateSignature" accept="image/*" onChange={handleFileChange} />
        </label>
        <label className="block">
          Left Thumb Impression:
          <input type="file" name="candidateLeftThumbImpression" accept="image/*" onChange={handleFileChange} />
        </label>
        <input type="text" name="apaarId" value={form.apaarId} onChange={handleChange} placeholder="Apaar ID" className="p-2 border rounded" />
        <label className="block">
          10th Marksheet:
          <input type="file" name="tenthMarksheet" accept="application/pdf,image/*" onChange={handleFileChange} />
        </label>
        <label className="block">
          12th Marksheet:
          <input type="file" name="twelfthMarksheet" accept="application/pdf,image/*" onChange={handleFileChange} />
        </label>
        <input type="text" name="exServicemen" value={form.exServicemen} onChange={handleChange} placeholder="Ex-Servicemen (if any)" className="p-2 border rounded" />
        <input type="text" name="speciallyAbled" value={form.speciallyAbled} onChange={handleChange} placeholder="Specially Abled (Yes/No)" className="p-2 border rounded" />
        <input type="text" name="speciallyAbledOther" value={form.speciallyAbledOther} onChange={handleChange} placeholder="If Other, please specify" className="p-2 border rounded" />
      </div>

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {loading ? 'Saving...' : 'Save & Next'}
      </button>
    </form>
  );
};

export default Documents;
