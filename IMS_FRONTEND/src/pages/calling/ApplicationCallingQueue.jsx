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
import { useThemeStore } from '@/store';

const ApplicationCallingQueue = () => {
  const { isDarkMode } = useThemeStore();
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
  }, []);

  const handleTableStateChange = async (params = {}) => {
    if (isLoadingRef.current) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const paramsString = JSON.stringify(params);
    if (lastParamsRef.current === paramsString) return;

    debounceTimeoutRef.current = setTimeout(async () => {
      lastParamsRef.current = paramsString;
      setIsInitialized(true);

      try {
        isLoadingRef.current = true;
        setLoading(true);

        const queryParams = {
          page: (params.pagination?.pageIndex ?? 0) + 1,
          limit: params.pagination?.pageSize ?? 10,
          search: params.globalFilter || '',
          sortBy: params.sorting?.[0]?.id || 'submittedAt',
          sortOrder: params.sorting?.[0]?.desc ? 'desc' : 'asc'
        };

        if (params.columnFilters && Array.isArray(params.columnFilters)) {
          params.columnFilters.forEach(filter => {
            if (filter.id && filter.value !== undefined && filter.value !== null && filter.value !== '') {
              queryParams[filter.id] = filter.value;
            }
          });
        }

        saveTableState(params);

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
    }, 300);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200',
      'under-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                <ServiceIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {application.fullName}
              </div>
              <div className="text-sm">
                <PhoneLink phone={application.mobileNumber} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} showIcon={true} />
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
            <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {application.serviceType.replace('-', ' ').toUpperCase()}
            </div>
            {application.subType && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{application.subType.toUpperCase()}</div>
            )}
          </div>
        );
      },
      filterComponent: ({ value, onChange }) => (
        <select
          value={value || ''}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange(e.target.value)}
          className={`px-2 py-1 rounded border text-xs w-full ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-slate-300 bg-white text-gray-900'}`}
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
        <div className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
          className={`px-2 py-1 rounded border text-xs w-full ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-slate-300 bg-white text-gray-900'}`}
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
        <div className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FaClock className="h-3 w-3 mr-1" />
          {formatDate(getValue())}
        </div>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ getValue }) => (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
  ], [isAdmin, availableFilters, isDarkMode]);

  const handleStartCall = (application) => {
    navigate(`/calling/lead/${application._id}?type=application&startCall=false`);
  };

  const handleViewDetails = (application) => {
    navigate(`/calling/profile/${application._id}?type=application`);
  };

  const handleRowClick = (row) => {
    handleViewDetails(row.original);
  };

  return (
    <div className="p-6">
      {/* Header with Stats Chips */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isAdmin ? 'Application Management Queue' : 'My Application Calling Queue'}
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isAdmin
                ? 'Manage applications assigned to you for oversight'
                : 'Manage your assigned applications and calling activities'
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
              {stats.total} Total
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-yellow-900/60 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
              {stats.pending} Pending
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-blue-900/60 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
              {stats['under-review']} Under Review
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-green-900/60 text-green-200' : 'bg-green-100 text-green-800'}`}>
              {stats.approved} Approved
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-red-900/60 text-red-200' : 'bg-red-100 text-red-800'}`}>
              {stats.rejected} Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className={`rounded-xl shadow border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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

