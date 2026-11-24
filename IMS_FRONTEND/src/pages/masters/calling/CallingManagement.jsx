import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import { ActionButton } from '@/components/permissions';
import LeadsList from './components/LeadsList';
import AddLeadModal from './components/AddLeadModal';
import AssignLeadsModal from './components/AssignLeadsModal';
import { FaPlus, FaFileImport, FaUserCheck, FaExchangeAlt } from 'react-icons/fa';
import useTableSessionStorage from '@/hooks/useTableSessionStorage';

import { useThemeStore } from '@/store';

const CallingManagement = () => {
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    leads,
    isLoading,
    staff,
    services,
    setLeads,
    setLoading,
    setStaff,
    setServices,
    assignLeadsToStaff
  } = useCallingStore();

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [showReassignMode, setShowReassignMode] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [availableFilters, setAvailableFilters] = useState({
    statuses: [],
    services: []
  });
  const isLoadingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const filterValue = location.state;

  // Session storage for table state
  const { saveTableState, restoreTableState } = useTableSessionStorage('calling-management');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      const [staffData, servicesData] = await Promise.all([
        callingService.getStaff(),
        callingService.getServices()
      ]);
      setStaff(staffData);
      setServices(servicesData);

      // Prepare initial query parameters
      const queryParams = { page: 1, limit: 10 };

      // Check if filter values are passed from navigation (like from Dashboard)
      if (filterValue?.status) {
        const filterStatus = filterValue.status;

        // Handle different dashboard filter types
        switch (filterStatus) {
          case 'unassigned':
            queryParams.status = 'unassigned';
            break;
          case 'assigned':
            queryParams.status = 'assigned';
            break;
          case 'called':
            queryParams.status = 'called';
            break;
          case 'not-called':
            // Filter for leads that are assigned but not called
            queryParams.assignedButNotCalled = true;
            break;
          case 'all-calls':
            // Filter for leads that have call history
            queryParams.hasCallHistory = true;
            break;
          case 'answered':
            // Filter for leads with answered calls
            queryParams.callAnswered = true;
            break;
          case 'not-answered':
            // Filter for leads with unanswered calls
            queryParams.callNotAnswered = true;
            break;
          case 'call-duration':
            // Filter for leads with call duration data
            queryParams.hasCallDuration = true;
            break;
          default:
            // For any other status, use it directly
            queryParams.status = filterStatus;
        }

        // Clear the location state after using it to prevent reuse on refresh
        window.history.replaceState({}, document.title);
      }

      // Load leads with initial pagination and filters
      const data = await callingService.getLeads(queryParams);
      setLeads(data.leads || []);
      setPagination({
        pageIndex: 0,
        pageSize: 10,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      });
      // Store available filters from API response
      if (data.filters) {
        setAvailableFilters({
          statuses: data.filters.availableStatuses || [],
          services: data.filters.availableServices || []
        });
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLeads([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const lastParamsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);



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
          sortBy: params.sorting?.[0]?.id || '',
          sortOrder: params.sorting?.[0]?.desc ? 'desc' : 'asc'
        };

        // Add unassigned filter if active
        if (showUnassignedOnly) {
          queryParams.status = 'unassigned';
        }

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

        const data = await callingService.getLeads(queryParams);
        setLeads(data.leads || []);
        setPagination({
          pageIndex: (data.pagination?.page || data.currentPage || 1) - 1,
          pageSize: data.pagination?.limit || data.limit || 10,
          totalItems: data.pagination?.total || data.totalItems || 0,
          totalPages: data.pagination?.pages || data.totalPages || 0
        });
        // Update available filters from API response
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
    }, 300); // 300ms debounce
  };

  const refreshLeads = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      const data = await callingService.getLeads({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      });
      setLeads(data.leads || []);
      setPagination(prev => ({
        ...prev,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error refreshing leads:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      await callingService.createLead(leadData);
      setShowAddModal(false);
      // Reset all states and reload
      await resetToDefaultState();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };



  const handleAssignLeads = async (staffId) => {
    try {
      // Filter out already assigned leads
      const unassignedLeadIds = selectedLeads.filter(leadId => {
        const lead = leads.find(l => l.id === leadId);
        return lead && (!lead.assignedTo || lead.status === 'unassigned');
      });

      if (unassignedLeadIds.length === 0) {
        alert('All selected leads are already assigned to staff members.');
        return;
      }

      if (unassignedLeadIds.length < selectedLeads.length) {
        const assignedCount = selectedLeads.length - unassignedLeadIds.length;
        const proceed = confirm(
          `${assignedCount} lead(s) are already assigned and will be skipped. Continue with ${unassignedLeadIds.length} unassigned lead(s)?`
        );
        if (!proceed) return;
      }

      await callingService.assignLeads(unassignedLeadIds, staffId);
      assignLeadsToStaff(unassignedLeadIds, staffId);
      setShowAssignModal(false);
      // Reset all states and reload
      await resetToDefaultState();
    } catch (error) {
      console.error('Error assigning leads:', error);
      alert('Failed to assign leads. Please try again.');
    }
  };

  const handleLeadClick = (lead) => {
    navigate(`/calling/lead/${lead.id}`);
  };

  const handleUnassignedFilter = async () => {
    const newFilterState = !showUnassignedOnly;
    setShowUnassignedOnly(newFilterState);
    setShowReassignMode(false); // Turn off reassign mode
    setSelectedLeads([]); // Clear selections

    // Immediately trigger a refresh with the new filter
    try {
      setLoading(true);
      const queryParams = {
        page: 1,
        limit: pagination.pageSize || 10,
      };

      if (newFilterState) {
        queryParams.status = 'unassigned';
      }

      console.log('Unassigned filter query:', queryParams); // Debug log

      const data = await callingService.getLeads(queryParams);
      setLeads(data.leads || []);
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize || 10,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      });
    } catch (error) {
      console.error('Error applying unassigned filter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignMode = async () => {
    const newReassignMode = !showReassignMode;
    setShowReassignMode(newReassignMode);
    setShowUnassignedOnly(false); // Turn off unassigned filter
    setSelectedLeads([]); // Clear selections

    // Load only assigned leads when entering reassign mode
    try {
      setLoading(true);
      const queryParams = {
        page: 1,
        limit: pagination.pageSize || 10,
      };

      if (newReassignMode) {
        queryParams.status = 'assigned';
      }

      const data = await callingService.getLeads(queryParams);
      setLeads(data.leads || []);
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize || 10,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      });
    } catch (error) {
      console.error('Error applying reassign filter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignLeads = async (staffId) => {
    try {
      await callingService.assignLeads(selectedLeads, staffId, true); // Pass true for forceReassign
      assignLeadsToStaff(selectedLeads, staffId);
      setShowAssignModal(false);
      // Reset all states and reload
      await resetToDefaultState();
    } catch (error) {
      console.error('Error reassigning leads:', error);
      alert('Failed to reassign leads. Please try again.');
    }
  };

  const resetToDefaultState = async () => {
    // Clear all filters and selections
    setSelectedLeads([]);
    setShowUnassignedOnly(false);
    setShowReassignMode(false);

    // Reload data from scratch
    try {
      setLoading(true);
      const data = await callingService.getLeads({
        page: 1,
        limit: 10
      });
      setLeads(data.leads || []);
      setPagination({
        pageIndex: 0,
        pageSize: 10,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      });
    } catch (error) {
      console.error('Error resetting state:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h6 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Management</h6>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add leads, bulk upload, multi-select, and assign to staff.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {pagination.totalItems} Leads
          </div>

          <ActionButton
            module="calling_admin"
            action="read"
            label={showUnassignedOnly ? "Show All Leads" : "Unassigned Only"}
            onClick={() => handleUnassignedFilter()}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${showUnassignedOnly
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            size="sm"
          />

          <ActionButton
            module="calling_admin"
            action="assign_leads"
            label={showReassignMode ? "Exit Reassign Mode" : "Reassign"}
            icon={<FaExchangeAlt />}
            onClick={() => handleReassignMode()}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${showReassignMode
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            size="sm"
          />

          <ActionButton
            module="calling_admin"
            action="create"
            label="Add Single Lead"
            icon={<FaPlus />}
            onClick={() => setShowAddModal(true)}
            size="sm"
          />

          <ActionButton
            module="calling_admin"
            action="bulk_import"
            label="Bulk Upload"
            icon={<FaFileImport />}
            onClick={() => navigate('/dashboard/calling-management/bulk-upload')}
            size="sm"
          />

          {!showReassignMode && (() => {
            const unassignedCount = selectedLeads.filter(leadId => {
              const lead = leads.find(l => l.id === leadId);
              return lead && (!lead.assignedTo || lead.status === 'unassigned');
            }).length;

            const assignedCount = selectedLeads.length - unassignedCount;

            return (
              <ActionButton
                module="calling_admin"
                action="assign_leads"
                label={
                  selectedLeads.length === 0
                    ? 'Assign Selected'
                    : assignedCount > 0
                      ? `Assign ${unassignedCount} Lead${unassignedCount !== 1 ? 's' : ''} (${assignedCount} already assigned)`
                      : `Assign ${unassignedCount} Lead${unassignedCount !== 1 ? 's' : ''}`
                }
                icon={<FaUserCheck />}
                onClick={() => setShowAssignModal(true)}
                size="sm"
                disabled={selectedLeads.length === 0 || unassignedCount === 0}
              />
            );
          })()}

          {selectedLeads.length > 0 && showReassignMode && (
            <ActionButton
              module="calling_admin"
              action="assign_leads"
              label={`Reassign ${selectedLeads.length} Lead${selectedLeads.length !== 1 ? 's' : ''}`}
              icon={<FaExchangeAlt />}
              onClick={() => setShowAssignModal(true)}
              size="sm"
            />
          )}


        </div>
      </div>

      <LeadsList
        leads={leads}
        isLoading={isLoading}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        onLeadClick={handleLeadClick}
        onStateChange={handleTableStateChange}
        serverPagination={true}
        pageCount={pagination.totalPages}
        totalItems={pagination.totalItems}
        currentPage={pagination.pageIndex + 1}
        filterValue={filterValue}
        reassignMode={showReassignMode}
        availableStatuses={availableFilters.statuses}
        availableServices={availableFilters.services}
        tableName="calling-management"
      />

      {showAddModal && (
        <AddLeadModal
          services={services}
          onSave={handleAddLead}
          onClose={() => setShowAddModal(false)}
        />
      )}



      {showAssignModal && (
        <AssignLeadsModal
          staff={staff}
          selectedCount={selectedLeads.length}
          onAssign={showReassignMode ? handleReassignLeads : handleAssignLeads}
          onClose={async () => {
            setShowAssignModal(false);
            // Reset all states when modal is closed without action
            await resetToDefaultState();
          }}
          isReassign={showReassignMode}
        />
      )}
    </div>
  );
};

export default CallingManagement;
