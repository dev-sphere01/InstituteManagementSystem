import { useState, useMemo } from 'react';
import { ActionButton } from '@/components/permissions';
import TableService from '@/services/TableService';
import { EmailLink, PhoneLink } from '@/components/common/ContactLinks';
import { FaEye, FaPhone, FaUser, FaClock } from 'react-icons/fa';
import useTableSessionStorage from '@/hooks/useTableSessionStorage';
import { createMultiFieldFilter } from '@/utils/multiFieldFilter.jsx';

const LeadsList = ({
  leads,
  isLoading,
  selectedLeads,
  onSelectionChange,
  onLeadClick,
  onStateChange,
  serverPagination,
  pageCount,
  totalItems,
  currentPage,
  filterValue,
  reassignMode = false,
  availableStatuses = [],
  availableServices = [],
  tableName = 'leads-list' // Allow parent to specify unique table name
}) => {
  const [selectAll, setSelectAll] = useState(false);
  
  // Session storage for table state
  const { saveTableState, restoreTableState } = useTableSessionStorage(tableName);

  // Wrap onStateChange to save state
  const handleStateChange = (state) => {
    if (state) {
      saveTableState(state);
    }
    if (onStateChange) {
      onStateChange(state);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      if (reassignMode) {
        // In reassign mode, select all assigned leads
        const assignedLeads = leads.filter(lead => lead.assignedTo && lead.status === 'assigned');
        onSelectionChange(assignedLeads.map(lead => lead.id));
      } else {
        // In normal mode, only select unassigned leads
        const unassignedLeads = leads.filter(lead => !lead.assignedTo || lead.status === 'unassigned');
        onSelectionChange(unassignedLeads.map(lead => lead.id));
      }
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      onSelectionChange([...selectedLeads, leadId]);
    } else {
      onSelectionChange(selectedLeads.filter(id => id !== leadId));
      setSelectAll(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      unassigned: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      'under-review': 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const formatStatusText = (status) => {
      if (status === 'under-review') return 'Under Review';
      return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unassigned';
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.unassigned}`}>
        {formatStatusText(status)}
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
      id: 'select',
      header: () => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">Select</label>
        </div>
      ),
      cell: ({ row }) => {
        const lead = row.original;
        const isAssigned = lead.assignedTo && lead.status !== 'unassigned';
        
        // In reassign mode, enable checkboxes for assigned leads
        // In normal mode, disable checkboxes for assigned leads
        const isDisabled = reassignMode ? !isAssigned : isAssigned;

        return (
          <input
            type="checkbox"
            checked={selectedLeads.includes(lead.id)}
            onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
            disabled={isDisabled}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            title={
              reassignMode 
                ? (isAssigned ? 'Select to reassign' : 'Only assigned leads can be reassigned')
                : (isAssigned ? 'This lead is already assigned' : 'Select to assign')
            }
          />
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: 'leadDetails',
      accessorKey: 'name',
      header: 'Lead Details',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <FaUser className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-4">
              <div
                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeadClick(lead);
                }}
              >
                {lead.name}
              </div>
              <div className="text-sm">
                <PhoneLink phone={lead.contactNo} className="text-gray-500" showIcon={true} />
              </div>
              {lead.email && (
                <div className="text-sm">
                  <EmailLink email={lead.email} className="text-gray-500" showIcon={true} />
                </div>
              )}
            </div>
          </div>
        );
      },
      filterComponent: createMultiFieldFilter('leadDetails', 'Search name, phone, email...'),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'selectedService',
      header: 'Service',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div>
            <div className="text-sm text-gray-900">{lead.selectedService}</div>
            {lead.serviceSubcategory && (
              <div className="text-sm text-gray-500">{lead.serviceSubcategory}</div>
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
          <option value="">All Services</option>
          {availableServices.map((service) => (
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
          className="px-2 py-1 rounded border border-slate-300 bg-white w-full text-xs"
        >
          <option value="">All Statuses</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
      ),
    },
    {
      accessorKey: 'assignedToName',
      header: 'Assigned To',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div>
            <div className="text-sm text-gray-900">
              {lead.assignedToName || '-'}
            </div>
            {lead.assignedAt && (
              <div className="text-sm text-gray-500 flex items-center">
                <FaClock className="h-3 w-3 mr-1" />
                {formatDate(lead.assignedAt)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
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
            module="calling_admin"
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
            module="calling_admin"
            action="read"
            icon={<FaEye />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile(row.original);
            }}
            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            title="View Profile"
            size="sm"
          />
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [selectedLeads, selectAll, onLeadClick, reassignMode, availableStatuses, availableServices]);

  const handleStartCall = (lead) => {
    // Navigate to lead details with startCall flag
    window.location.href = `/calling/lead/${lead.id}?startCall=false`;
  };

  const handleViewProfile = (lead) => {
    // Navigate to profile view page
    window.location.href = `/calling/profile/${lead.id}`;
  };



  // Prepare initial filters from filterValue
  const initialFilters = useMemo(() => {
    const filters = [];
    if (filterValue?.status) {
      filters.push({ id: 'status', value: filterValue.status });
    }
    return filters;
  }, [filterValue]);

  // Always show table, even when no data - let TableService handle empty state

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">

      <TableService
        columns={columns}
        data={leads}
        loading={isLoading}
        onStateChange={handleStateChange}
        initialPageSize={10}
        serverPagination={serverPagination}
        serverFiltering={serverPagination}
        serverSorting={serverPagination}
        pageCount={pageCount}
        totalItems={totalItems}
        currentPage={currentPage}
        initialFilters={initialFilters}
        restoreState={restoreTableState()}
      />
    </div>
  );
};

export default LeadsList;