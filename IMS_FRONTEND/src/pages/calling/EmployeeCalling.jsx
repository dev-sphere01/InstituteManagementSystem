import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import TableService from '@/services/TableService';
import { PhoneLink } from '@/components/common/ContactLinks';
import { FaPhone, FaEye, FaClock, FaUser } from 'react-icons/fa';
import { ActionButton } from '@/components/permissions';
import useTableSessionStorage from '@/hooks/useTableSessionStorage';
import { createMultiFieldFilter } from '@/utils/multiFieldFilter.jsx';
import { useThemeStore } from '@/store';

const EmployeeCalling = () => {
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const {
    leads,
    isLoading,
    setLeads,
    setLoading,
    restoreSession
  } = useCallingStore();

  // Session storage for table state
  const { saveTableState, restoreTableState } = useTableSessionStorage('employee-calling-queue');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });
  const [availableFilters, setAvailableFilters] = useState({
    statuses: [],
    services: []
  });
  const isLoadingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastParamsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    restoreSession();
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
          assignedToMe: true,
          page: (params.pagination?.pageIndex ?? 0) + 1,
          limit: params.pagination?.pageSize ?? 10,
          search: params.globalFilter || '',
          sortBy: params.sorting?.[0]?.id || '',
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

        const data = await callingService.getLeads(queryParams);
        setLeads(data.leads || []);
        setPagination({
          pageIndex: (data.pagination?.page || data.currentPage || 1) - 1,
          pageSize: data.pagination?.limit || data.limit || 10,
          totalItems: data.pagination?.total || data.totalItems || 0,
          totalPages: data.pagination?.pages || data.totalPages || 0
        });
        if (data.filters) {
          setAvailableFilters({
            statuses: data.filters.availableStatuses || [],
            services: data.filters.availableServices || []
          });
        }
      } catch (error) {
        console.error('Error loading leads:', error);
        setLeads([]);
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
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.assigned}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Assigned'}
      </span>
    );
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
      id: 'leadDetails',
      accessorKey: 'name',
      header: 'Lead Details',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                <FaUser className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {lead.name}
              </div>
              <div className="text-sm">
                <PhoneLink phone={lead.contactNo} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} showIcon={true} />
              </div>
            </div>
          </div>
        );
      },
      filterComponent: createMultiFieldFilter('leadDetails', 'Search name, phone...'),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'selectedService',
      header: 'Service',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div>
            <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lead.selectedService}</div>
            {lead.serviceSubcategory && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lead.serviceSubcategory}</div>
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
          <option value="">All Services</option>
          {availableFilters.services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
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
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
      accessorKey: 'lastCallAt',
      header: 'Last Call',
      cell: ({ getValue }) => (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {getValue() ? formatDate(getValue()) : 'Never'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <ActionButton
            module="calling_employee"
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
            module="calling_employee"
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
  ], [availableFilters, isDarkMode]);

  const handleStartCall = (lead) => {
    navigate(`/calling/lead/${lead.id}?startCall=false`);
  };

  const handleViewDetails = (lead) => {
    navigate(`/calling/profile/${lead.id}`);
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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Calling Queue</h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your assigned leads and calling activities</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
              {stats.total} Total
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-yellow-900/60 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
              {stats.pending} Pending
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-green-900/60 text-green-200' : 'bg-green-100 text-green-800'}`}>
              {stats.completed} Completed
            </div>
            <div className={`px-3 py-1 text-sm font-medium rounded-full ${isDarkMode ? 'bg-red-900/60 text-red-200' : 'bg-red-100 text-red-800'}`}>
              {stats.failed} Failed
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className={`rounded-xl shadow border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <TableService
          columns={columns}
          data={leads}
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

export default EmployeeCalling;