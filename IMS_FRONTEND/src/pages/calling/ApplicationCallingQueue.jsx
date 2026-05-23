import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '@/services/applicationService';
import TableService from '@/services/TableService';
import { PhoneLink } from '@/components/common/ContactLinks';
import { FaPhone, FaEye, FaClock, FaCreditCard, FaShieldAlt, FaMoneyBillWave } from 'react-icons/fa';
import { ActionButton } from '@/components/permissions';
import { useNotification } from '@/services/NotificationService';
import { useAuth } from '@/context/AuthContext';
import useTableSessionStorage from '@/hooks/useTableSessionStorage';
import { createMultiFieldFilter } from '@/utils/multiFieldFilter.jsx';

const ApplicationCallingQueue = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.roleId?.name?.toLowerCase().includes('admin') ||
    user?.roleId?.name?.toLowerCase().includes('super');

  // Session storage for table state
  const { saveTableState, restoreTableState } = useTableSessionStorage('application-calling-queue');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    'under-review': 0,
    approved: 0,
    rejected: 0
  });
  const [availableFilters, setAvailableFilters] = useState({
    statuses: [],
    serviceTypes: [],
    subTypes: []
  });
  const isLoadingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastParamsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    // Initial load will be triggered by TableService's onStateChange
  }, []);

  const loadInitialDataWithState = async (savedState) => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);

      // Build query parameters from saved state
      const params = {
        page: (savedState.pagination?.pageIndex || 0) + 1,
        limit: savedState.pagination?.pageSize || 10,
        sortBy: savedState.sorting?.[0]?.id || 'submittedAt',
        sortOrder: savedState.sorting?.[0]?.desc ? 'desc' : 'asc',
        ...(savedState.globalFilter && { search: savedState.globalFilter }),
      };

      // Add column filters
      if (savedState.columnFilters) {
        savedState.columnFilters.forEach(filter => {
          params[filter.id] = filter.value;
        });
      }

      const response = await applicationService.getMyAssignedApplications(params);

      if (response.success) {
        const applicationsData = response.data || [];
        setApplications(applicationsData);
        setPagination({
          pageIndex: (response.pagination?.currentPage || 1) - 1,
          pageSize: response.pagination?.itemsPerPage || 10,
          totalItems: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 0
        });

        if (response.filters) {
          setAvailableFilters({
            statuses: response.filters.availableStatuses || [],
            serviceTypes: response.filters.availableServiceTypes || [],
            subTypes: response.filters.availableSubTypes || []
          });
        }

        const calculatedStats = {
          total: applicationsData.length,
          pending: applicationsData.filter(app => app.status === 'pending').length,
          'under-review': applicationsData.filter(app => app.status === 'under-review').length,
          approved: applicationsData.filter(app => app.status === 'approved').length,
          rejected: applicationsData.filter(app => app.status === 'rejected').length
        };
        setStats(calculatedStats);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading assigned applications:', error);
      setApplications([]);
      notify(`Failed to load applications: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const loadInitialData = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);

      // Debug user information
      console.log('Current user:', user);
      console.log('User ID:', user?._id || user?.id);
      console.log('Is Admin:', isAdmin);

      // Load applications data
      const params = {
        page: 1,
        limit: 10
      };

      // Use getMyAssignedApplications endpoint for both admin and employees
      const response = await applicationService.getMyAssignedApplications(params);

      if (response.success) {
        const applicationsData = response.data || [];
        console.log('Loaded applications:', applicationsData.length);
        console.log('Applications data:', applicationsData);

        setApplications(applicationsData);
        setPagination({
          pageIndex: 0,
          pageSize: 10,
          totalItems: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 0
        });

        // Store available filters from API response
        if (response.filters) {
          setAvailableFilters({
            statuses: response.filters.availableStatuses || [],
            serviceTypes: response.filters.availableServiceTypes || [],
            subTypes: response.filters.availableSubTypes || []
          });
        }

        // Calculate stats from applications
        const calculatedStats = {
          total: applicationsData.length,
          pending: applicationsData.filter(app => app.status === 'pending').length,
          'under-review': applicationsData.filter(app => app.status === 'under-review').length,
          approved: applicationsData.filter(app => app.status === 'approved').length,
          rejected: applicationsData.filter(app => app.status === 'rejected').length
        };
        setStats(calculatedStats);
        console.log('Calculated stats:', calculatedStats);
      } else {
        console.error('API response not successful:', response);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading assigned applications:', error);
      console.error('Error details:', error.response?.data || error.message);
      setApplications([]);
      notify(`Failed to load applications: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleTableStateChange = async (params = {}) => {
    // Prevent concurrent calls
    if (isLoadingRef.current) {
      return;
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Prevent duplicate calls with same parameters
    const paramsString = JSON.stringify(params);
    if (lastParamsRef.current === paramsString) {
      return;
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(async () => {
      lastParamsRef.current = paramsString;
      setIsInitialized(true);

      try {
        isLoadingRef.current = true;
        setLoading(true);

        // Build query parameters with safe defaults
        const queryParams = {
          page: (params.pagination?.pageIndex ?? 0) + 1,
          limit: params.pagination?.pageSize ?? 10,
          search: params.globalFilter || '',
          sortBy: params.sorting?.[0]?.id || 'submittedAt',
          sortOrder: params.sorting?.[0]?.desc ? 'desc' : 'asc'
        };

        // Add column filters
        if (params.columnFilters && Array.isArray(params.columnFilters)) {
          params.columnFilters.forEach(filter => {
            if (filter.id && filter.value !== undefined && filter.value !== null && filter.value !== '') {
              queryParams[filter.id] = filter.value;
            }
          });
        }

        // Save table state to session storage
        saveTableState(params);

        // Use getMyAssignedApplications endpoint for both admin and employees
        const response = await applicationService.getMyAssignedApplications(queryParams);

        if (response.success) {
          const applicationsData = response.data || [];
          setApplications(applicationsData);
          setPagination({
            pageIndex: (response.pagination?.currentPage || 1) - 1,
            pageSize: response.pagination?.itemsPerPage || 10,
            totalItems: response.pagination?.totalItems || 0,
            totalPages: response.pagination?.totalPages || 0
          });
          // Store available filters from API response
          if (response.filters) {
            setAvailableFilters({
              statuses: response.filters.availableStatuses || [],
              serviceTypes: response.filters.availableServiceTypes || [],
              subTypes: response.filters.availableSubTypes || []
            });
          }
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplications([]);
        setPagination(prev => ({
          ...prev,
          totalItems: 0,
          totalPages: 0
        }));
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }, 300); // 300ms debounce
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'under-review': 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
        {status?.replace('-', ' ').toUpperCase() || 'PENDING'}
      </span>
    );
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'credit-card': FaCreditCard,
      'insurance': FaShieldAlt,
      'loan': FaMoneyBillWave
    };
    return icons[serviceType] || FaCreditCard;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = useMemo(() => [
    {
      id: 'applicantDetails',
      accessorKey: 'fullName',
      header: 'Applicant Details',
      cell: ({ row }) => {
        const application = row.original;
        const ServiceIcon = getServiceIcon(application.serviceType);
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ServiceIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {application.fullName}
              </div>
              <div className="text-sm">
                <PhoneLink phone={application.mobileNumber} className="text-gray-500" showIcon={true} />
              </div>
            </div>
          </div>
        );
      },
      filterComponent: createMultiFieldFilter('applicantDetails', 'Search name, PAN...'),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'serviceType',
      header: 'Service',
      cell: ({ row }) => {
        const application = row.original;
        return (
          <div>
            <div className="text-sm text-gray-900">
              {application.serviceType.replace('-', ' ').toUpperCase()}
            </div>
            {application.subType && (
              <div className="text-sm text-gray-500">{application.subType.toUpperCase()}</div>
            )}
          </div>
        );
      },
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
    },
    {
      accessorKey: 'applicationId',
      header: 'Application ID',
      cell: ({ row }) => (
        <div className="text-sm font-mono text-gray-900">
          {row.original.applicationId}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getStatusBadge(getValue()),
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
    },
    {
      accessorKey: 'assignedAt',
      header: 'Assigned',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500 flex items-center">
          <FaClock className="h-3 w-3 mr-1" />
          {formatDate(getValue())}
        </div>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500">
          {formatDate(getValue())}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <ActionButton
            module="applications_employee"
            action="start_call"
            icon={<FaPhone />}
            onClick={(e) => {
              e.stopPropagation();
              handleStartCall(row.original);
            }}
            className="p-2 bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
            title="Start Call"
            size="sm"
          />
          <ActionButton
            module="applications_employee"
            action="read"
            icon={<FaEye />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row.original);
            }}
            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            title="View Details"
            size="sm"
          />
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [isAdmin, availableFilters]);



  const handleStartCall = (application) => {
    // Navigate to lead details page with application ID to start call
    navigate(`/calling/lead/${application._id}?type=application&startCall=false`);
  };

  const handleViewDetails = (application) => {
    // Navigate to profile page with application ID
    navigate(`/calling/profile/${application._id}?type=application`);
  };

  const handleRowClick = (row) => {
    // Navigate to lead details page with application ID
    handleViewDetails(row.original);
  };

  return (
    <div className="p-6">
      {/* Header with Stats Chips */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Application Management Queue' : 'My Application Calling Queue'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? 'Manage applications assigned to you for oversight'
                : 'Manage your assigned applications and calling activities'
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {stats.total} Total
            </div>
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              {stats.pending} Pending
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {stats['under-review']} Under Review
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {stats.approved} Approved
            </div>
            <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {stats.rejected} Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableService
          columns={columns}
          data={applications}
          loading={isLoading}
          onRowClick={handleRowClick}
          onStateChange={handleTableStateChange}
          initialPageSize={10}
          serverPagination={true}
          serverFiltering={true}
          serverSorting={true}
          pageCount={pagination.totalPages}
          totalItems={pagination.totalItems}
          currentPage={pagination.pageIndex + 1}
          restoreState={restoreTableState()}
        />
      </div>

    </div>
  );
};

export default ApplicationCallingQueue;
