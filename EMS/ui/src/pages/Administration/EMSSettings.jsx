import React, { useState, useEffect } from 'react';
import { Settings, FileText, UserCheck, Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import IncrementLetterService from '@/services/Payroll/incrementLetterService';
import notification from '@/services/NotificationService';
import getBaseFileURL from '@/utils/getBaseFileURL';

const EMSSettings = () => {
    const [activeTab, setActiveTab] = useState('templates');
    const [templates, setTemplates] = useState([]);
    const [signatories, setSignatories] = useState([]);
    const [loading, setLoading] = useState(false);
    const baseFileURL = getBaseFileURL();

    // Form states
    const [templateForm, setTemplateForm] = useState({ TemplateID: 0, Name: '', Content: '', Language: 'English', Type: 'IncrementLetter', IsActive: true });
    const [signatoryForm, setSignatoryForm] = useState({ SignatoryID: 0, Name: '', Designation: '', IsDefault: false, signatureImage: null });
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [isEditingSignatory, setIsEditingSignatory] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewHTML, setPreviewHTML] = useState('');

    const handlePreview = () => {
        let content = templateForm.Content;
        const dummyData = {
            '[EmployeeName]': 'John Doe',
            '[FirstName]': 'John',
            '[EmployeeCode]': 'EMP001',
            '[Designation]': 'Software Engineer',
            '[Department]': 'IT',
            '[PreviousCTC]': '10,00,000.00',
            '[PreviousMonthlySalary]': '83,333.33',
            '[IncrementAmount]': '1,00,000.00',
            '[IncrementPercentage]': '10.00',
            '[NewCTC]': '11,00,000.00',
            '[NewMonthlySalary]': '91,666.67',
            '[WEFDate]': '01-Apr-2024',
            '[NextMonth]': 'May 2024',
            '[Date]': new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            '[SignatoryName]': 'Jane Smith',
            '[SignatoryDesignation]': 'HR Manager',
            '[SignatorySignature]': '<div style="margin-bottom:10px;"><img src="https://via.placeholder.com/150x60?text=Signature" style="height:60px;" /></div>'
        };

        Object.keys(dummyData).forEach(key => {
            content = content.split(key).join(dummyData[key]);
        });

        setPreviewHTML(content);
        setShowPreview(true);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [templatesData, signatoriesData] = await Promise.all([
                IncrementLetterService.getTemplates(),
                IncrementLetterService.getSignatories()
            ]);
            setTemplates(templatesData);
            setSignatories(signatoriesData);
        } catch (error) {
            notification().error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            await IncrementLetterService.saveTemplate(templateForm);
            notification().success("Template saved successfully");
            setTemplateForm({ TemplateID: 0, Name: '', Content: '', Language: 'English', Type: 'IncrementLetter', IsActive: true });
            setIsEditingTemplate(false);
            fetchData();
        } catch (error) {
            notification().error("Failed to save template");
        }
    };

    const handleSaveSignatory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('signatoryID', signatoryForm.SignatoryID);
        formData.append('name', signatoryForm.Name);
        formData.append('designation', signatoryForm.Designation);
        formData.append('isDefault', signatoryForm.IsDefault);
        if (signatoryForm.signatureImage) {
            formData.append('signatureImage', signatoryForm.signatureImage);
        }

        try {
            await IncrementLetterService.saveSignatory(formData);
            notification().success("Signatory saved successfully");
            setSignatoryForm({ SignatoryID: 0, Name: '', Designation: '', IsDefault: false, signatureImage: null });
            setIsEditingSignatory(false);
            fetchData();
        } catch (error) {
            notification().error("Failed to save signatory");
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            try {
                await IncrementLetterService.deleteTemplate(id);
                notification().success("Template deleted");
                fetchData();
            } catch (error) {
                notification().error("Failed to delete template");
            }
        }
    };

    const handleDeleteSignatory = async (id) => {
        if (window.confirm("Are you sure you want to delete this signatory?")) {
            try {
                await IncrementLetterService.deleteSignatory(id);
                notification().success("Signatory deleted");
                fetchData();
            } catch (error) {
                notification().error("Failed to delete signatory");
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Settings className="text-gray-600" /> EMS Settings (CRM)
            </h1>

            <div className="flex border-b mb-6">
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('templates')}
                >
                    Letter Templates
                </button>
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'signatories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('signatories')}
                >
                    Signatories
                </button>
            </div>

            {activeTab === 'templates' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Templates</h2>
                        {!isEditingTemplate && (
                            <button 
                                onClick={() => setIsEditingTemplate(true)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm"
                            >
                                <Plus size={16} /> Add Template
                            </button>
                        )}
                    </div>

                    {isEditingTemplate && (
                        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                            <form onSubmit={handleSaveTemplate}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Template Name</label>
                                        <input 
                                            type="text" required
                                            className="w-full border rounded-md p-2"
                                            value={templateForm.Name}
                                            onChange={(e) => setTemplateForm({...templateForm, Name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Language</label>
                                        <select 
                                            className="w-full border rounded-md p-2"
                                            value={templateForm.Language}
                                            onChange={(e) => setTemplateForm({...templateForm, Language: e.target.value})}
                                        >
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">HTML Content</label>
                                        <textarea 
                                            required rows={10}
                                            className="w-full border rounded-md p-2 font-mono text-sm"
                                            placeholder="Enter HTML content with placeholders like [EmployeeName], [NewCTC], etc."
                                            value={templateForm.Content}
                                            onChange={(e) => setTemplateForm({...templateForm, Content: e.target.value})}
                                        ></textarea>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Available placeholders: [EmployeeName], [FirstName], [EmployeeCode], [Designation], [Department], [PreviousCTC], [PreviousMonthlySalary], [IncrementAmount], [IncrementPercentage], [NewCTC], [NewMonthlySalary], [WEFDate], [NextMonth], [Date], [SignatoryName], [SignatoryDesignation], [SignatorySignature], [ThisMonth]
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => {setIsEditingTemplate(false); setTemplateForm({ TemplateID: 0, Name: '', Content: '', Language: 'English', Type: 'IncrementLetter', IsActive: true });}} className="px-3 py-1.5 border rounded-md">Cancel</button>
                                    <button type="button" onClick={handlePreview} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md flex items-center gap-1"><FileText size={16}/> Preview</button>
                                    <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1"><Save size={16}/> Save Template</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(t => (
                            <div key={t.TemplateID} className="bg-white border rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{t.Name}</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => {setTemplateForm(t); setIsEditingTemplate(true);}} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteTemplate(t.TemplateID)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t.Language}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${t.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.IsActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate h-12 overflow-hidden border-t pt-2 mt-2">
                                    {t.Content ? t.Content.substring(0, 100) : ''}...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'signatories' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Signatories</h2>
                        {!isEditingSignatory && (
                            <button 
                                onClick={() => setIsEditingSignatory(true)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm"
                            >
                                <Plus size={16} /> Add Signatory
                            </button>
                        )}
                    </div>

                    {isEditingSignatory && (
                        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                            <form onSubmit={handleSaveSignatory}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input 
                                            type="text" required
                                            className="w-full border rounded-md p-2"
                                            value={signatoryForm.Name}
                                            onChange={(e) => setSignatoryForm({...signatoryForm, Name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Designation</label>
                                        <input 
                                            type="text" required
                                            className="w-full border rounded-md p-2"
                                            value={signatoryForm.Designation}
                                            onChange={(e) => setSignatoryForm({...signatoryForm, Designation: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Signature Image</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            className="w-full border rounded-md p-1.5 text-sm"
                                            onChange={(e) => setSignatoryForm({...signatoryForm, signatureImage: e.target.files[0]})}
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={signatoryForm.IsDefault}
                                                onChange={(e) => setSignatoryForm({...signatoryForm, IsDefault: e.target.checked})}
                                            />
                                            <span className="text-sm font-medium">Set as Default Signatory</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => {setIsEditingSignatory(false); setSignatoryForm({ SignatoryID: 0, Name: '', Designation: '', IsDefault: false, signatureImage: null });}} className="px-3 py-1.5 border rounded-md">Cancel</button>
                                    <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1"><Save size={16}/> Save Signatory</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {signatories.map(s => (
                            <div key={s.SignatoryID} className={`bg-white border rounded-lg p-6 shadow-sm ${s.IsDefault ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{s.Name}</h3>
                                        <p className="text-gray-600 text-sm">{s.Designation}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => {
                                            setSignatoryForm({ SignatoryID: s.SignatoryID, Name: s.Name, Designation: s.Designation, IsDefault: s.IsDefault, signatureImage: null });
                                            setIsEditingSignatory(true);
                                        }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteSignatory(s.SignatoryID)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                
                                {s.SignatureImagePath ? (
                                    <div className="h-20 flex items-center justify-center border-t border-b py-2 my-4 bg-gray-50">
                                        <img 
                                            src={`${baseFileURL}${s.SignatureImagePath}`} 
                                            alt="Signature" 
                                            className="max-h-full"
                                            onError={(e) => {e.target.onerror = null; e.target.src='https://via.placeholder.com/150x50?text=No+Signature'}}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-20 flex flex-col items-center justify-center border-t border-b py-2 my-4 bg-gray-50 text-gray-400">
                                        <ImageIcon size={32} />
                                        <span className="text-xs">No Signature Image</span>
                                    </div>
                                )}

                                {s.IsDefault && (
                                    <div className="mt-2 text-center">
                                        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold uppercase">Default</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Template Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-8 bg-gray-100">
                            <div 
                                className="bg-white shadow-lg mx-auto p-[1in] min-h-[11in] w-[8.5in]"
                                dangerouslySetInnerHTML={{ __html: previewHTML }}
                            ></div>
                        </div>
                        <div className="p-4 border-t flex justify-end bg-gray-50">
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EMSSettings;
