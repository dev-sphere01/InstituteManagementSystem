import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    CheckCircle, Clock, TrendingUp, AlertCircle, 
    CheckSquare, Square, Upload, FileSpreadsheet,
    X, RefreshCw, Plus, UserPlus, Search, Loader2, Play,
    Trash2, RotateCcw
} from 'lucide-react';
import { IncrementService, Employees, notification } from '@/services';
import IncrementLetterService from '@/services/Payroll/incrementLetterService';
import TableService from '@/services/TableService';
import ExcelImportService from '@/services/ExcelMappingService';

const ManageIncrements = () => {
    const notify = notification();
    const [increments, setIncrements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showUpload, setShowUpload] = useState(false);
    
    // Filters
    const [globalSearch, setGlobalSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Sessions
    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState('');

    // Bulk Upload States
    const [myData, setMyData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    // Individual Increment States
    const [showIndividual, setShowIndividual] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allEmployees, setAllEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        incrementPercentage: '',
        wefDate: new Date().toLocaleDateString('en-CA')
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingManual, setIsProcessingManual] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(globalSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [globalSearch]);

    // Optimized Fetch with stable dependencies
    const fetchIncrements = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter) params.approvalStatus = statusFilter;
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const data = await IncrementService.getAllIncrements(params);
            setIncrements(data || []);
        } catch (error) {
            notify.error("Failed to fetch increments");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter, fromDate, toDate]);

    const fetchEmployees = async () => {
        try {
            const data = await Employees.getAllEmployees();
            setAllEmployees(data || []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const fetchSessions = async () => {
        try {
            const data = await IncrementLetterService.getSessions();
            setSessions(data || []);
            if (data && data.length > 0) {
                // Find most recent or set first
                setSessionId(data[0].ReviewSessionID);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    useEffect(() => {
        fetchIncrements();
    }, [fetchIncrements]);

    useEffect(() => {
        fetchEmployees();
        fetchSessions();
    }, []);

    // Stable callbacks for ExcelImportService to prevent infinite loops
    const handleDataChange = useCallback((data) => {
        setMyData(data);
    }, []);

    const handleFileReset = useCallback(() => {
        setMyData([]);
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredEmployees([]);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = allEmployees.filter(emp => 
                emp.FirstName?.toLowerCase().includes(query) || 
                emp.LastName?.toLowerCase().includes(query) || 
                emp.EmpID?.toString().includes(query)
            ).slice(0, 10);
            setFilteredEmployees(filtered);
        }
    }, [searchQuery, allEmployees]);

    // Checkbox Handlers
    const toggleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === increments.length && increments.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(increments.map(i => i.IncrementID)));
        }
    }, [increments, selectedIds.size]);

    // Approval Handlers
    const handleApprove = async (id) => {
        try {
            await IncrementService.approveIncrement(id);
            notify.success("Increment approved successfully");
            fetchIncrements();
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (error) {
            notify.error(error.message || "Failed to approve increment");
        }
    };

    const handleBulkApprove = async () => {
        const pendingIds = increments
            .filter(i => selectedIds.has(i.IncrementID) && i.ApprovalStatus === 'Pending')
            .map(i => i.IncrementID);

        if (pendingIds.length === 0) return notify.error("No pending increments selected");

        try {
            const result = await IncrementService.bulkApproveIncrements(pendingIds);
            notify.success(result?.Message || "Selected increments approved successfully");
            setSelectedIds(prev => {
                const next = new Set(prev);
                pendingIds.forEach(id => next.delete(id));
                return next;
            });
            fetchIncrements();
        } catch (error) {
            notify.error(error.message || "Failed to approve selected increments");
        }
    };

    const handleBulkDelete = async () => {
        const deletableIds = increments
            .filter(i => selectedIds.has(i.IncrementID) && !i.IsProcessed)
            .map(i => i.IncrementID);

        if (deletableIds.length === 0) return notify.error("No deletable increments selected");
        if (!window.confirm(`Are you sure you want to delete ${deletableIds.length} increments?`)) return;

        try {
            const result = await IncrementService.bulkDeleteIncrements(deletableIds);
            notify.success(result?.Message || "Selected increments deleted successfully");
            setSelectedIds(prev => {
                const next = new Set(prev);
                deletableIds.forEach(id => next.delete(id));
                return next;
            });
            fetchIncrements();
        } catch (error) {
            notify.error(error.message || "Failed to delete selected increments");
        }
    };

    const handleBulkRollback = async () => {
        const selectedList = increments.filter(i => selectedIds.has(i.IncrementID));
        if (selectedList.length === 0) return notify.error("No increments selected");

        if (!window.confirm(`This action will rollback and delete ${selectedList.length} selected increments. Are you sure?`)) return;

        try {
            const result = await IncrementService.bulkRollbackIncrements(selectedList.map(i => i.IncrementID));
            notify.success(result?.Message || "Selected increments rolled back successfully");
            setSelectedIds(new Set());
            fetchIncrements();
        } catch (error) {
            notify.error(error.message || "Failed to rollback selected increments");
        }
    };

    const handleManualProcess = async () => {
        setIsProcessingManual(true);
        try {
            const result = await IncrementService.manualProcess();
            notify.success(result?.Message || "Increments processed successfully");
            fetchIncrements();
        } catch (error) {
            notify.error(error.message || "Failed to process increments");
        } finally {
            setIsProcessingManual(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this increment?")) return;
        try {
            await IncrementService.deleteIncrement(id);
            notify.success("Increment deleted successfully");
            fetchIncrements();
        } catch (error) {
            notify.error(error.message || "Failed to delete increment");
        }
    };

    const handleRollback = async (id) => {
        if (!window.confirm("This action will revert the employee's CTC to previous values and delete the increment record. Are you sure?")) return;
        try {
            await IncrementService.rollbackIncrement(id);
            notify.success("Increment rolled back successfully");
            fetchIncrements();
        } catch (error) {
            notify.error(error.message || "Failed to rollback increment");
        }
    };

    // Date Parser for WEF
    const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    let d;
    
    if (dateStr instanceof Date) {
        d = dateStr;
    } 
    else if (!isNaN(dateStr) && !isNaN(parseFloat(dateStr)) && parseFloat(dateStr) > 40000) {
        const excelDate = parseFloat(dateStr);
        d = new Date((excelDate - 25569) * 86400 * 1000);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00.000Z`;
    }
    else {
        const dateString = dateStr.toString().trim();
        const parts = dateString.split(/[-/.]/);
        
        if (parts.length === 3) {
            let day, month, year;
            if (parts[0].length === 4) {
                year = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                day = parseInt(parts[2]);
            } else {
                day = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                year = parseInt(parts[2]);
                if (year < 100) year += 2000;
            }
            d = new Date(year, month, day);
        } else {
            d = new Date(dateStr);
        }
    }

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}T00:00:00.000Z`;
};

    const handleIndividualSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return notify.error("Please select an employee");
        if (!formData.incrementPercentage) return notify.error("Please enter increment percentage");
        if (!formData.wefDate) return notify.error("Please select WEF date");
        if (!sessionId) return notify.error("Please select a session");

        setIsSubmitting(true);
        try {
            const data = [{
                EmpID: selectedEmployee.EmpID,
                IncrementPercentage: parseFloat(formData.incrementPercentage),
                WEF: `${formData.wefDate}T00:00:00.000Z`
            }];
            await IncrementService.bulkUploadIncrements(data, sessionId);
            notify.success("Increment assigned successfully");
            fetchIncrements();
            setShowIndividual(false);
            setSelectedEmployee(null);
            setSearchQuery('');
            setFormData({
                incrementPercentage: '',
                wefDate: new Date().toLocaleDateString('en-CA')
            });
        } catch (error) {
            notify.error(error.message || "Failed to assign increment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImport = async () => {
        if (myData.length === 0) return notify.error("No data to upload");
        if (!sessionId) return notify.error("Please select a session");
        setIsImporting(true);
        
        console.log("Starting import with data:", myData.slice(0, 2));

        try {
            const errors = [];
            const transformedData = myData.map((item, index) => {
                const empId = parseInt(item.EmpID);
                const perc = parseFloat(item.IncrementPercentage?.toString().replace('%', ''));
                const wef = parseDate(item.WEF);
                
                const missingFields = [];
                if (isNaN(empId)) missingFields.push("EmpID");
                if (isNaN(perc)) missingFields.push("Increment %");
                if (!wef) missingFields.push("WEF Date");

                if (missingFields.length > 0) {
                    errors.push(`Row ${index + 1}: Missing or invalid ${missingFields.join(', ')}`);
                    return null;
                }
                
                return {
                    EmpID: empId,
                    IncrementPercentage: perc,
                    WEF: wef
                };
            }).filter(Boolean);

            if (transformedData.length === 0) {
                const errorMsg = errors.length > 0 ? errors.slice(0, 3).join('; ') : "No valid data found.";
                throw new Error(errorMsg);
            }

            if (errors.length > 0) {
                notify.warning(`${errors.length} rows skipped due to errors.`);
                console.warn("Skipped rows:", errors);
            }

            const result = await IncrementService.bulkUploadIncrements(transformedData, sessionId);
            setImportResult(result);
            notify.success(result.Message || `${transformedData.length} increments uploaded successfully`);
            fetchIncrements();
            setShowUpload(false);
            setMyData([]);
        } catch (error) {
            notify.error(error.message || "Failed to upload increments");
            console.error("Import error:", error);
        } finally {
            setIsImporting(false);
        }
    };

    const predefinedFields = useMemo(() => [
        { key: 'EmpID', label: 'Employee ID', required: true, variations: ['empid', 'emp id', 'employee id', 'id'] },
        { key: 'EmployeeName', label: 'Employee Name', required: false, variations: ['name', 'employeename'] },
        { key: 'IncrementPercentage', label: 'Increment %', required: true, variations: ['percentage', 'increment %'] },
        { key: 'WEF', label: 'WEF Date', required: true, variations: ['wef', 'wef date', 'effective date'] }
    ], []);

    const columns = useMemo(() => [
        {
            id: 'selection',
            header: () => (
                <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                    {selectedIds.size > 0 && selectedIds.size === increments.length 
                        ? <CheckSquare className="w-5 h-5 text-blue-600" /> 
                        : <Square className="w-5 h-5 text-gray-400" />
                    }
                </button>
            ),
            cell: ({ row }) => (
                <button onClick={() => toggleSelect(row.original.IncrementID)} className="p-1 hover:bg-gray-100 rounded">
                    {selectedIds.has(row.original.IncrementID) 
                        ? <CheckSquare className="w-5 h-5 text-blue-600" /> 
                        : <Square className="w-5 h-5 text-gray-300" />
                    }
                </button>
            )
        },
        {
            header: 'Employee',
            accessorKey: 'EmployeeName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{row.original.EmployeeName}</span>
                    <span className="text-xs text-gray-500">ID: {row.original.EmpID}</span>
                </div>
            )
        },
        {
            header: 'Current CTC',
            accessorKey: 'PreviousCTC',
            cell: ({ getValue }) => <span className="font-medium">₹{getValue()?.toLocaleString() || 0}</span>
        },
        {
            header: 'Increment %',
            accessorKey: 'IncrementPercentage',
            cell: ({ getValue }) => <span className="text-green-600 font-bold">+{getValue()}%</span>
        },
        {
            header: 'New CTC',
            accessorKey: 'NewCTC',
            cell: ({ getValue }) => <span className="font-bold text-blue-700">₹{getValue()?.toLocaleString() || 0}</span>
        },
        {
            header: 'Arrears',
            accessorKey: 'ArrearsAmount',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-orange-600">₹{getValue()?.toLocaleString() || 0}</span>
                    {row.original.ArrearsPaid && <span className="text-[9px] text-green-600 font-bold uppercase">Paid</span>}
                </div>
            )
        },
        {
            header: 'WEF Date',
            accessorKey: 'WEFDate',
            cell: ({ getValue }) => {
                const val = getValue();
                if (!val) return <span className="text-gray-400">-</span>;
                
                // Parse date string carefully to avoid timezone shifts
                // Takes the YYYY-MM-DD part and creates a local date
                const datePart = val.split('T')[0];
                const [y, m, d] = datePart.split('-').map(Number);
                const localDate = new Date(y, m - 1, d);
                
                return (
                    <span className="text-gray-600 font-medium">
                        {localDate.toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                        })}
                    </span>
                );
            }
        },
        {
            header: 'Status',
            accessorKey: 'ApprovalStatus',
            cell: ({ getValue, row }) => (
                <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        getValue() === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                        {getValue()?.toUpperCase()}
                    </span>
                    {row.original.IsProcessed && <span className="text-[10px] text-blue-600 font-bold">SYNCED</span>}
                </div>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.ApprovalStatus === 'Pending' && (
                        <button 
                            onClick={() => handleApprove(row.original.IncrementID)} 
                            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Approve"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {row.original.IsProcessed ? (
                        <button
                            onClick={() => handleRollback(row.original.IncrementID)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200"
                            title="Roll Back & Delete"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleDelete(row.original.IncrementID)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ], [selectedIds, increments, toggleSelect, toggleSelectAll, handleApprove, handleRollback, handleDelete]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> Salary Increments
                    </h1>
                    <p className="text-sm text-gray-500">Manage and upload employee salary revisions</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                            {increments.some(i => selectedIds.has(i.IncrementID) && i.ApprovalStatus === 'Pending') && (
                                <button onClick={handleBulkApprove} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 flex items-center gap-2 transition-all">
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                            )}
                            {increments.some(i => selectedIds.has(i.IncrementID) && i.IsProcessed) && (
                                <button onClick={handleBulkRollback} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 flex items-center gap-2 transition-all">
                                    <RotateCcw className="w-4 h-4" /> Roll Back
                                </button>
                            )}
                            {increments.some(i => selectedIds.has(i.IncrementID) && !i.IsProcessed) && (
                                <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 flex items-center gap-2 transition-all">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            )}
                            <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>
                            <span className="text-sm font-bold text-gray-500 mr-2">{selectedIds.size} selected</span>
                        </div>
                    )}
                    <button onClick={() => { setShowIndividual(true); setShowUpload(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Assign Individual
                    </button>
                    <button onClick={() => { setShowUpload(!showUpload); setShowIndividual(false); }} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2">
                        {showUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {showUpload ? 'Cancel' : 'Bulk Upload'}
                    </button>
                    <button 
                        onClick={handleManualProcess} 
                        disabled={isProcessingManual}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold shadow-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-50"
                        title="Process approved increments where WEF date is today or past"
                    >
                        {isProcessingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Process Increments
                    </button>
                    <button onClick={fetchIncrements} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {showIndividual && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <UserPlus className="text-blue-600" /> Individual Increment Assignment
                        </h2>
                        <button onClick={() => setShowIndividual(false)} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleIndividualSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text"
                                    value={selectedEmployee ? `${selectedEmployee.FirstName} ${selectedEmployee.LastName || ''} (${selectedEmployee.EmpID})` : searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (selectedEmployee) setSelectedEmployee(null);
                                    }}
                                    placeholder="Name or ID..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {selectedEmployee && (
                                    <button 
                                        type="button"
                                        onClick={() => { setSelectedEmployee(null); setSearchQuery(''); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                    </button>
                                )}
                            </div>

                            {searchQuery && !selectedEmployee && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map(emp => (
                                            <button
                                                key={emp.EmpID}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedEmployee(emp);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex flex-col border-b border-gray-50 last:border-0"
                                            >
                                                <span className="font-bold text-gray-900">{emp.FirstName} {emp.LastName}</span>
                                                <span className="text-xs text-gray-500">ID: {emp.EmpID} • {emp.Department}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No employees found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Increment Percentage (%)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={formData.incrementPercentage}
                                onChange={(e) => setFormData(prev => ({ ...prev, incrementPercentage: e.target.value }))}
                                placeholder="e.g. 10.5"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WEF Date</label>
                            <input 
                                type="date"
                                value={formData.wefDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, wefDate: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                            <select 
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Session</option>
                                {sessions.map(s => (
                                    <option key={s.ReviewSessionID} value={s.ReviewSessionID}>{s.SessionName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                            <button 
                                type="button"
                                onClick={() => setShowIndividual(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting || !selectedEmployee}
                                className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    'Assign Increment'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showUpload && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 animate-in fade-in slide-in-from-top-4">
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                        <div className="mb-4 flex flex-col md:flex-row gap-4 items-end border-b pb-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Increment Session</label>
                                <select 
                                    value={sessionId}
                                    onChange={(e) => setSessionId(e.target.value)}
                                    className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map(s => (
                                        <option key={s.ReviewSessionID} value={s.ReviewSessionID}>{s.SessionName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <ExcelImportService 
                            predefinedFields={predefinedFields} 
                            onDataChange={handleDataChange} 
                            onFileReset={handleFileReset}
                            headerRow={1}
                        />
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <FileSpreadsheet className="w-10 h-10 text-green-600 mb-3" />
                        <h3 className="font-bold mb-1">Upload Guide</h3>
                        <p className="text-xs text-gray-500 mb-4">Required: EmpID, Increment %, WEF Date</p>
                        <button 
                            disabled={myData.length === 0 || isImporting}
                            onClick={handleImport}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            {isImporting ? 'Processing...' : 'Start Upload'}
                        </button>
                    </div>
                </div>
            )}

            {/* Global Search and Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        placeholder="Search by Employee Name, ID or CTC..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all"
                    />
                </div>
                
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all"
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                </select>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">WEF Range:</span>
                    <input 
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm transition-all"
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none text-sm transition-all"
                    />
                </div>

                {(globalSearch || statusFilter || fromDate || toDate) && (
                    <button 
                        onClick={() => {
                            setGlobalSearch('');
                            setStatusFilter('');
                            setFromDate('');
                            setToDate('');
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Clear Filters"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <TableService columns={columns} data={increments} loading={loading} />
            </div>

            {!loading && increments.length === 0 && (
                <div className="mt-8 flex flex-col items-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">No increment records found</p>
                </div>
            )}
        </div>
    );
};

export default ManageIncrements;
