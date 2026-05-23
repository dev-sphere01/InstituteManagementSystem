import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Download,
    RefreshCw,
    UserPlus
} from 'lucide-react';
import applicationService from '@/services/applicationService';
import TableService from '@/services/TableService';
import * as XLSX from 'xlsx';
import { ActionButton } from '@/components/permissions';
import ApplicationDetailsModal from '@/components/applications/ApplicationDetailsModal';
import AssignmentModal from '@/components/applications/AssignmentModal';
import { useNotification } from '@/services/NotificationService';
import useTableSessionStorage from '@/hooks/useTableSessionStorage';
import { createMultiFieldFilter } from '@/utils/multiFieldFilter.jsx';
import ErrorBanner from '@/components/common/ErrorBanner';

export default function ApplicationsList() {
    const notify = useNotification();
    const location = useLocation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [staff, setStaff] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const isMountedRef = useRef(true);
    const isInitialLoadRef = useRef(true);
    const filterValue = location.state;

    // Session storage for table state
    const { saveTableState, restoreTableState, clearTableState } = useTableSessionStorage('applications-list');

    // Pagination state for server-side pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Available filters from API
    const [availableFilters, setAvailableFilters] = useState({
        statuses: [],
        serviceTypes: [],
        subTypes: []
    });

    // Fetch applications function
    const fetchApplications = useCallback(async (tableState) => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters from table state
            const params = {
                page: (tableState?.pagination?.pageIndex || 0) + 1,
                limit: tableState?.pagination?.pageSize || 10,
                sortBy: tableState?.sorting?.[0]?.id || 'submittedAt',
                sortOrder: tableState?.sorting?.[0]?.desc ? 'desc' : 'asc',
                ...(tableState?.globalFilter && { search: tableState.globalFilter }),
            };

            // Add dashboard filter if present (only on initial load)
            if (isInitialLoadRef.current && filterValue?.status) {
                params.status = filterValue.status;
                // Clear the location state after using it to prevent reuse on refresh
                window.history.replaceState({}, document.title);
            }

            // Add column filters
            if (tableState?.columnFilters) {
                tableState.columnFilters.forEach(filter => {
                    params[filter.id] = filter.value;
                });
            }

            // Save table state to session storage
            if (tableState) {
                saveTableState(tableState);
            }

            const response = await applicationService.getApplications(params);

            if (response.success) {
                const applicationsData = response.data || [];
                setApplications(applicationsData);
                setPagination({
                    currentPage: response.pagination?.currentPage || 1,
                    totalPages: response.pagination?.totalPages || 1,
                    totalItems: response.pagination?.totalItems || 0,
                    itemsPerPage: response.pagination?.itemsPerPage || 10
                });
                // Store available filters from API response
                if (response.filters) {
                    setAvailableFilters({
                        statuses: response.filters.availableStatuses || [],
                        serviceTypes: response.filters.availableServiceTypes || [],
                        subTypes: response.filters.availableSubTypes || []
                    });
                }
            } else {
                setError(response.message || 'Failed to fetch applications');
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            if (err.code === 'ERR_NETWORK' || err.code === 'ERR_INSUFFICIENT_RESOURCES') {
                setError('Cannot connect to server. Please ensure the API server is running on http://localhost:4000');
            } else {
                setError('Failed to load applications. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle table state changes
    const handleTableStateChange = useCallback((newState) => {
        // Skip the first call if it's the initial load
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
        }
        
        // Always fetch with the new state
        fetchApplications(newState);
    }, [fetchApplications]);

    // Initial load - will be triggered by TableService's onStateChange
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Manual refresh function
    const handleRefresh = useCallback(() => {
        // Restore saved state on refresh
        const savedState = restoreTableState();
        if (savedState && Object.keys(savedState).length > 0) {
            fetchApplications(savedState);
        } else {
            fetchApplications();
        }
    }, [fetchApplications, restoreTableState]);

    // Simple Excel export function
    const handleExportToExcel = useCallback(() => {
        if (!applications || applications.length === 0) {
            return;
        }

        try {
            // Prepare data for export
            const exportData = applications.map(app => ({
                'Application ID': app.applicationId,
                'Service Type': app.serviceType?.replace('-', ' ').toUpperCase(),
                'Sub Type': app.subType?.toUpperCase() || '',
                'Full Name': app.fullName,
                'PAN Number': app.panNumber,
                'Mobile Number': app.mobileNumber,
                'Location': app.location,
                'Monthly Income': app.monthlyIncome || '',
                'Employment Type': app.employmentType?.toUpperCase() || '',
                'Credit Score': app.creditScore || '',
                'Status': app.status?.replace('-', ' ').toUpperCase(),
                'Pre-approved': app.preApproved ? 'Yes' : 'No',
                'Assigned To': app.assignedTo ? `${app.assignedTo.firstName} ${app.assignedTo.lastName}` : 'Unassigned',
                'Submitted Date': new Date(app.submittedAt).toLocaleDateString(),
                'Created Date': new Date(app.createdAt).toLocaleDateString()
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Auto-adjust column widths
            const colWidths = Object.keys(exportData[0]).map(key => ({
                wch: Math.max(key.length, 15)
            }));
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Applications');

            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `applications_${dateStr}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);
        } catch (error) {
            console.error('Export error:', error);
        }
    }, [applications]);

    // View application details
    const viewDetails = async (applicationId) => {
        try {
            const response = await applicationService.getApplication(applicationId);
            if (response.success) {
                setSelectedApplication(response.data);
                setShowDetails(true);
            }
        } catch (err) {
            console.error('Error fetching application details:', err);
            notify('Failed to load application details.', 'error');
        }
    };

    // Handle row click
    const handleRowClick = (row) => {
        viewDetails(row.original._id);
    };

    // Fetch staff for assignment
    const fetchStaff = async () => {
        try {
            const response = await applicationService.getStaffForAssignment();
            console.log('Staff API response:', response);
            if (response.success) {
                console.log('Staff data:', response.data);
                setStaff(response.data);
            } else {
                console.error('Failed to fetch staff:', response);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    // Bulk assign applications
    const bulkAssignApplications = async (applicationIds, staffId) => {
        try {
            const response = await applicationService.bulkAssignApplications(applicationIds, staffId);
            if (response.success) {
                handleRefresh();
                setSelectedApplications([]);
                return response.results;
            } else {
                notify(`Failed to bulk assign applications: ${response.message}`, 'error');
                return null;
            }
        } catch (error) {
            console.error('Error bulk assigning applications:', error);
            notify('Failed to bulk assign applications. Please try again.', 'error');
            return null;
        }
    };

    // Handle assignment modal
    const handleShowAssignModal = () => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key])
            .map(index => applications[parseInt(index)]?._id)
            .filter(Boolean);
        
        if (selectedIds.length === 0) {
            notify('Please select at least one application to assign', 'warning');
            return;
        }
        
        setSelectedApplications(selectedIds);
        fetchStaff();
        setShowAssignModal(true);
    };

    // Handle select all checkbox
    const handleSelectAll = (checked) => {
        if (checked) {
            const newSelection = {};
            applications.forEach((_, index) => {
                newSelection[index] = true;
            });
            setRowSelection(newSelection);
        } else {
            setRowSelection({});
        }
    };

    // Handle individual row selection
    const handleRowSelection = (rowIndex, checked) => {
        setRowSelection(prev => ({
            ...prev,
            [rowIndex]: checked
        }));
    };

    // Get selected count
    const selectedCount = Object.values(rowSelection).filter(Boolean).length;

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'under-review': { color: 'bg-blue-100 text-blue-800', icon: Eye },
            'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
            'cancelled': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon size={12} />
                {status.replace('-', ' ').toUpperCase()}
            </span>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Define table columns
    const columns = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={selectedCount > 0 && selectedCount === applications.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={rowSelection[row.index] || false}
                    onChange={(e) => handleRowSelection(row.index, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableColumnFilter: false,
            size: 50,
        },
        {
            id: 'serviceType',
            header: 'Service Type',
            accessorKey: 'serviceType',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {row.original.serviceType.replace('-', ' ').toUpperCase()}
                    </div>
                    {row.original.subType && (
                        <div className="text-sm text-gray-500">
                            {row.original.subType.toUpperCase()}
                        </div>
                    )}
                </div>
            ),
            filterComponent: ({ value, onChange }) => (
                <select
                    value={value || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChange(e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 bg-white w-full text-xs"
                >
                    <option value="">All Service Types</option>
                    {availableFilters.serviceTypes.map((type) => (
                        <option key={type} value={type}>
                            {type.replace('-', ' ').toUpperCase()}
                        </option>
                    ))}
                </select>
            ),
            enableSorting: true,
        },
        {
            id: 'applicantDetails',
            header: 'Applicant Details',
            accessorKey: 'fullName',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{row.original.fullName}</div>
                    <div className="text-sm text-gray-500">PAN: {row.original.panNumber}</div>
                    {row.original.dateOfBirth && (
                        <div className="text-sm text-gray-500">
                            DOB: {new Date(row.original.dateOfBirth).toLocaleDateString()}
                        </div>
                    )}
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'contactInfo',
            header: 'Contact Info',
            accessorKey: 'mobileNumber',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm text-gray-900">{row.original.mobileNumber}</div>
                    <div className="text-sm text-gray-500">{row.original.location}</div>
                    {row.original.aadhaarNumber && (
                        <div className="text-sm text-gray-500">
                            Aadhaar: {row.original.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                        </div>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: 'assignment',
            header: 'Assignment',
            cell: ({ row }) => (
                <div>
                    {row.original.assignedTo ? (
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {row.original.assignedTo.firstName} {row.original.assignedTo.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                                Assigned: {formatDate(row.original.assignedAt)}
                            </div>
                            {row.original.assignedBy && (
                                <div className="text-xs text-gray-500">
                                    By: {row.original.assignedBy.firstName} {row.original.assignedBy.lastName}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                        </span>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <div>
                    {getStatusBadge(row.original.status)}
                    {row.original.reviewedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                            Reviewed: {formatDate(row.original.reviewedAt)}
                        </div>
                    )}
                </div>
            ),
            filterComponent: ({ value, onChange }) => (
                <select
                    value={value || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChange(e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 bg-white w-full text-xs"
                >
                    <option value="">All Statuses</option>
                    {availableFilters.statuses.map((status) => (
                        <option key={status} value={status}>
                            {status.replace('-', ' ').toUpperCase()}
                        </option>
                    ))}
                </select>
            ),
            enableSorting: true,
        },
        {
            id: 'submittedAt',
            header: 'Submitted Date',
            accessorKey: 'submittedAt',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm text-gray-900">
                        {formatDate(row.original.submittedAt)}
                    </div>
                    {row.original.createdAt && row.original.createdAt !== row.original.submittedAt && (
                        <div className="text-xs text-gray-500">
                            Created: {formatDate(row.original.createdAt)}
                        </div>
                    )}
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <ActionButton
                        module="applications"
                        action="read"
                        label="View"
                        size="sm"
                        icon={<Eye size={12} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            viewDetails(row.original._id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    />
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
            size: 80,
        },
    ], [selectedCount, applications.length, rowSelection, availableFilters]);

    return (
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
                        <p className="text-gray-600">
                            Manage and review all application submissions
                            {selectedCount > 0 && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {selectedCount} selected
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {selectedCount > 0 && (
                            <ActionButton
                                module="applications"
                                action="update"
                                label={`Assign (${selectedCount})`}
                                icon={<UserPlus size={16} />}
                                onClick={handleShowAssignModal}
                                className="bg-purple-600 hover:bg-purple-700"
                            />
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <ActionButton
                            module="applications"
                            action="read"
                            label="Export to Excel"
                            icon={<Download size={16} />}
                            onClick={handleExportToExcel}
                            disabled={loading || applications.length === 0}
                            className="bg-green-600 hover:bg-green-700"
                        />
                    </div>
                </div>

                {/* Error Banner */}
                <ErrorBanner 
                    error={error}
                    onRetry={handleRefresh}
                    title="Error Loading Applications"
                    className="mb-4"
                />

                {/* Applications Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <TableService
                        columns={columns}
                        data={applications}
                        loading={loading}
                        serverPagination={true}
                        pageCount={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        totalPages={pagination.totalPages}
                        currentPage={pagination.currentPage}
                        onStateChange={handleTableStateChange}
                        onRowClick={handleRowClick}
                        initialPageSize={10}
                        restoreState={restoreTableState()}
                    />
                </div>

                {/* Application Details Modal */}
                {showDetails && selectedApplication && (
                    <ApplicationDetailsModal
                        application={selectedApplication}
                        onClose={() => setShowDetails(false)}
                    />
                )}

                {/* Assignment Modal */}
                {showAssignModal && (
                    <AssignmentModal
                        applications={selectedApplications}
                        staff={staff}
                        onClose={() => {
                            setShowAssignModal(false);
                            setSelectedApplications([]);
                        }}
                        onAssign={async (applicationIds, staffId) => {
                            const results = await bulkAssignApplications(applicationIds, staffId);
                            if (results) {
                                if (results.assigned > 0) {
                                    notify(`Assignment completed: ${results.assigned} applications assigned successfully`, 'success');
                                }
                                if (results.alreadyAssigned > 0) {
                                    notify(`${results.alreadyAssigned} applications were already assigned`, 'info');
                                }
                                if (results.errors.length > 0) {
                                    notify(`${results.errors.length} applications failed to assign`, 'error');
                                }
                            }
                            setShowAssignModal(false);
                            setSelectedApplications([]);
                            setRowSelection({});
                        }}
                    />
                )}
            </div>
    );
}
