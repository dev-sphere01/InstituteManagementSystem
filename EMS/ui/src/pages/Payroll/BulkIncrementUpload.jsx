import React, { useState, useCallback, useMemo } from 'react';
import { Download, Upload, TrendingUp, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { IncrementService, notification } from '@/services';
import ExcelImportService from '@/services/ExcelMappingService';

const BulkIncrementUpload = () => {
    const notify = notification();
    const [myData, setMyData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null); // 'success', 'error', null
    const [importResult, setImportResult] = useState(null);
    const [file, setFile] = useState(null);

    const predefinedFields = useMemo(() => [
        {
            key: 'EmpID',
            label: 'Employee ID',
            required: true,
            variations: ['empid', 'emp id', 'employee id', 'id', 'employeeid']
        },
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            required: false,
            variations: ['employee name', 'name', 'employeename', 'emp name']
        },
        {
            key: 'IncrementPercentage',
            label: 'Increment Percentage',
            required: true,
            variations: ['increment percentage', 'percentage', 'increment %', 'incrementpercentage']
        },
        {
            key: 'WEF',
            label: 'WEF Date',
            required: true,
            variations: ['wef', 'wef date', 'effective date', 'date']
        }
    ], []);

    const handleDataChange = useCallback((newData, file) => {
        setMyData(newData);
        setFile(file);
        setImportStatus(null);
        setImportResult(null);
    }, []);

    const handleFileReset = useCallback(() => {
        setMyData([]);
        setFile(null);
        setImportStatus(null);
        setImportResult(null);
    }, []);

    const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    let d;
    
    // Handle Date objects
    if (dateStr instanceof Date) {
        d = dateStr;
    } 
    // Handle numeric Excel date (serial number)
    else if (!isNaN(dateStr) && !isNaN(parseFloat(dateStr)) && parseFloat(dateStr) > 40000) {
        const excelDate = parseFloat(dateStr);
        d = new Date((excelDate - 25569) * 86400 * 1000);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00.000Z`;
    }
    // Handle Strings - Prioritize DD/MM/YYYY parsing
    else {
        const dateString = dateStr.toString().trim();
        const parts = dateString.split(/[-/.]/); // Support /, -, and . separators
        
        if (parts.length === 3) {
            let day, month, year;
            // Case: YYYY-MM-DD
            if (parts[0].length === 4) {
                year = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                day = parseInt(parts[2]);
            } 
            // Case: DD/MM/YYYY or DD-MM-YYYY
            else {
                day = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                year = parseInt(parts[2]);
                if (year < 100) year += 2000;
            }
            d = new Date(year, month, day);
        } else {
            // Fallback to native constructor if format is unusual
            d = new Date(dateStr);
        }
    }

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}T00:00:00.000Z`;
};

    const handleImport = async () => {
        if (myData.length === 0) {
            notify.error("No data to upload");
            return;
        }

        setIsImporting(true);
        try {
            const transformedData = myData.map(item => ({
                EmpID: parseInt(item.EmpID),
                IncrementPercentage: parseFloat(item.IncrementPercentage),
                WEF: parseDate(item.WEF)
            })).filter(item => !isNaN(item.EmpID) && !isNaN(item.IncrementPercentage) && item.WEF !== null);

            if (transformedData.length === 0) {
                throw new Error("No valid records found after transformation. Please check column mapping.");
            }

            const result = await IncrementService.bulkUploadIncrements(transformedData);
            setImportStatus('success');
            setImportResult(result);
            notify.success(result.Message || "Increments uploaded successfully");
        } catch (error) {
            setImportStatus('error');
            setImportResult({ message: error.message || "Upload failed" });
            notify.error(error.message || "Failed to upload increments");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Increment Upload</h1>
                </div>
                <p className="text-gray-600">Upload salary increment details for multiple employees at once.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-gray-600" />
                                Upload & Map Columns
                            </h2>
                        </div>
                        <div className="p-4">
                            <ExcelImportService
                                predefinedFields={predefinedFields}
                                onDataChange={handleDataChange}
                                onFileReset={handleFileReset}
                                headerRow={1}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Ensure your Excel has columns for EmpID, Increment Percentage, and WEF Date.
                        </p>
                        <button 
                            onClick={handleImport}
                            disabled={myData.length === 0 || isImporting}
                            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                myData.length === 0 || isImporting 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                            }`}
                        >
                            {isImporting ? 'Processing...' : 'Process Upload'}
                        </button>
                    </div>

                    {importStatus === 'success' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                                <CheckCircle className="w-5 h-5" />
                                Success
                            </div>
                            <p className="text-sm text-green-700">{importResult.Message}</p>
                            {importResult.Errors?.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                    <p className="text-xs font-bold text-red-600">Errors encountered:</p>
                                    <ul className="text-xs text-red-500 list-disc ml-4 mt-1">
                                        {importResult.Errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkIncrementUpload;
