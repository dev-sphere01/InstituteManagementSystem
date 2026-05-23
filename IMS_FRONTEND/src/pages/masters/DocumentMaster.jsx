import React, { useState, useEffect } from 'react';
import API from '../../services/API';
import { useNotification } from '../../services/NotificationService';

const DocumentMaster = () => {
  const notify = useNotification();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    isRequired: false,
    isActive: true
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/document-master');
      if (res.success) {
        setDocuments(res.data || []);
      }
    } catch (err) {
      notify('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (doc = null) => {
    if (doc) {
      setCurrentDoc(doc);
      setFormData({
        key: doc.key,
        label: doc.label,
        isRequired: doc.isRequired,
        isActive: doc.isActive
      });
    } else {
      setCurrentDoc(null);
      setFormData({
        key: '',
        label: '',
        isRequired: false,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDoc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentDoc) {
        const res = await API.put(`/document-master/${currentDoc._id}`, formData);
        if (res.success) {
          notify('Document updated successfully', 'success');
        }
      } else {
        const res = await API.post('/document-master', formData);
        if (res.success) {
          notify('Document added successfully', 'success');
        }
      }
      closeModal();
      fetchDocuments();
    } catch (err) {
      notify(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await API.delete(`/document-master/${id}`);
      if (res.success) {
        notify('Document deleted successfully', 'success');
        fetchDocuments();
      }
    } catch (err) {
      notify('Failed to delete document', 'error');
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-medium text-slate-500">Loading Documents Master...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Document Master</h1>
            <p className="text-sm font-medium text-slate-500">Manage documents required for student verification.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-lg shadow-sm transition-all"
          >
            Add New Document
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Key (Internal)</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Display Label</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">Required</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">Active</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No documents configured.</td>
                  </tr>
                ) : documents.map(doc => (
                  <tr key={doc._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm font-semibold text-slate-700">{doc.key}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">{doc.label}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${doc.isRequired ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {doc.isRequired ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${doc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-end">
                      <button onClick={() => openModal(doc)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">Edit</button>
                      <button onClick={() => handleDelete(doc._id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800">{currentDoc ? 'Edit Document' : 'Add Document'}</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document Key</label>
                    <input 
                      required
                      type="text"
                      disabled={!!currentDoc}
                      value={formData.key}
                      onChange={(e) => setFormData({...formData, key: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})}
                      placeholder="e.g. candidatePhoto (no spaces)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Unique internal identifier. Use camelCase without spaces.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Display Label</label>
                    <input 
                      required
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({...formData, label: e.target.value})}
                      placeholder="e.g. Candidate Photo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                  
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isRequired} 
                        onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Is Required</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isActive} 
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Is Active</span>
                    </label>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 text-[11px] font-medium p-3 rounded-lg border border-blue-100">
                    <strong>Note:</strong> If "Is Required" is checked, the Document Verification step will only auto-complete when this document is received.
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all">Save Document</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentMaster;
