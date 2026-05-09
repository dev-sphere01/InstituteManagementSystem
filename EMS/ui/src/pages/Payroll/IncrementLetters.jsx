import React, { useState, useEffect, useCallback } from 'react';
import { ScrollText, Download, Filter, Search, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import IncrementLetterService from '@/services/Payroll/incrementLetterService';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import notification from '@/services/NotificationService';
import { generateFromHtml, generateFromHtmlAsBlob } from '@/services/ExportPDFService';
import getBaseFileURL from '@/utils/getBaseFileURL';

const IncrementLetters = () => {
    const [sessions, setSessions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [templates, setTemplates] = useState([]);
    
    const [filters, setFilters] = useState({
        sessionId: '',
        deptId: '',
        empId: '',
        templateId: ''
    });

    const [loading, setLoading] = useState(false);
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [letters, setLetters] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [sessionsData, deptsData, templatesData] = await Promise.all([
                IncrementLetterService.getSessions(),
                getAllDepartments(),
                IncrementLetterService.getTemplates()
            ]);
            setSessions(sessionsData);
            setDepartments(deptsData);
            setTemplates(templatesData);
            
            if (sessionsData.length > 0) {
                setFilters(prev => ({ ...prev, sessionId: sessionsData[0].ReviewSessionID }));
            }
            if (templatesData.length > 0) {
                const active = templatesData.find(t => t.IsActive);
                if (active) setFilters(prev => ({ ...prev, templateId: active.TemplateID }));
            }
        } catch (error) {
            notification().error("Failed to fetch initial data");
        }
    };

    useEffect(() => {
        const fetchDeptEmployees = async () => {
            if (filters.deptId) {
                try {
                    const data = await IncrementLetterService.getEmployeesByDepartment(filters.deptId);
                    setFilteredEmployees(data || []);
                } catch (error) {
                    console.error("Failed to fetch department employees", error);
                    setFilteredEmployees([]);
                }
                setFilters(prev => ({ ...prev, empId: '' }));
            } else {
                setFilteredEmployees([]);
                setFilters(prev => ({ ...prev, empId: '' }));
            }
        };

        fetchDeptEmployees();
    }, [filters.deptId]);

    const handleGenerate = async () => {
        if (!filters.sessionId) {
            notification().error("Please select a session");
            return;
        }
        setLoading(true);
        try {
            const data = await IncrementLetterService.generateLetters(filters);
            setLetters(data);
            if (data.length === 0) {
                notification().info("No increments found for the selected criteria");
            }
        } catch (error) {
            notification().error("Failed to generate letters");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (letter) => {
        try {
            // Prepend base URL to images if they are relative
            let content = letter.HtmlContent;
            const baseUrl = getBaseFileURL();
            content = content.replace(/src="\/Signatures\//g, `src="${baseUrl}/Signatures/`);

            // Using utility to generate PDF from HTML
            await generateFromHtml(content, `Increment_Letter_${letter.EmployeeName.replace(' ', '_')}.pdf`);
            notification().success(`Downloaded letter for ${letter.EmployeeName}`);
        } catch (error) {
            notification().error("Failed to download PDF");
        }
    };

    const handleDownloadAll = async () => {
        if (letters.length === 0) return;
        setDownloadingAll(true);
        const zip = new JSZip();
        const baseUrl = getBaseFileURL();

        try {
            notification().info(`Preparing ${letters.length} letters...`);
            
            for (const letter of letters) {
                let content = letter.HtmlContent;
                content = content.replace(/src="\/Signatures\//g, `src="${baseUrl}/Signatures/`);
                
                const blob = await generateFromHtmlAsBlob(content);
                const fileName = `Increment_Letter_${letter.EmployeeName.replace(/\s+/g, '_')}_${letter.EmpID}.pdf`;
                zip.file(fileName, blob);
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipFileName = `Increment_Letters_${new Date().getTime()}.zip`;
            
            // Simple download link for the zip
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipFileName;
            link.click();
            
            notification().success("Bulk download completed successfully");
        } catch (error) {
            console.error("Bulk download failed:", error);
            notification().error("Failed to generate zip file");
        } finally {
            setDownloadingAll(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ScrollText className="text-blue-600" /> Increment Letters
                </h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                        <select 
                            className="w-full border rounded-md p-2"
                            value={filters.sessionId}
                            onChange={(e) => setFilters({...filters, sessionId: e.target.value})}
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => (
                                <option key={s.ReviewSessionID} value={s.ReviewSessionID}>{s.SessionName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select 
                            className="w-full border rounded-md p-2"
                            value={filters.deptId}
                            onChange={(e) => setFilters({...filters, deptId: e.target.value})}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                        <select 
                            className="w-full border rounded-md p-2"
                            value={filters.empId}
                            onChange={(e) => setFilters({...filters, empId: e.target.value})}
                            disabled={!filters.deptId}
                        >
                            <option value="">All Employees</option>
                            {filteredEmployees.map(e => (
                                <option key={e.EmpID} value={e.EmpID}>{e.FirstName} {e.LastName} ({e.EmpID})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                        <select 
                            className="w-full border rounded-md p-2"
                            value={filters.templateId}
                            onChange={(e) => setFilters({...filters, templateId: e.target.value})}
                        >
                            {templates.map(t => (
                                <option key={t.TemplateID} value={t.TemplateID}>{t.Name} ({t.Language})</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-4 flex justify-end gap-2">
                        <button 
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Search size={18} /> {loading ? 'Generating...' : 'Search Increments'}
                        </button>
                    </div>
                </div>
            </div>

            {letters.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <span className="font-semibold">{letters.length} Letters Found</span>
                        <button 
                            onClick={handleDownloadAll}
                            disabled={downloadingAll}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                            {downloadingAll ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Zip...</>
                            ) : (
                                <><Download size={16} /> Download All (Zip)</>
                            )}
                        </button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs uppercase text-gray-600 font-bold">
                                <th className="px-6 py-3">Emp ID</th>
                                <th className="px-6 py-3">Employee Name</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {letters.map((letter) => (
                                <tr key={letter.EmpID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{letter.EmpID}</td>
                                    <td className="px-6 py-4 font-medium">{letter.EmployeeName}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDownload(letter)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IncrementLetters;
