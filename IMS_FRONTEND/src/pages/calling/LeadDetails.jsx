import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import dynamicFormService from '@/services/dynamicFormService';
import { EmailLink, PhoneLink, WebsiteLink } from '@/components/common/ContactLinks';
import { ActionButton } from '@/components/permissions';
import FormBuilderModal from '@/components/calling/FormBuilderModal';
import CallingFormRenderer from '@/components/calling/CallingFormRenderer';
import {
  Phone,
  PhoneOff,
  User,
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  CreditCard,
  Building,
  Shield,
  FileText
} from 'lucide-react';

const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { currentLead, services, setCurrentLead, setServices, startCallSession, endCallSession, isCallSessionActive, sessionData, updateCallSessionState } = useCallingStore();

  // Check if this is an application or lead
  const urlParams = new URLSearchParams(window.location.search);
  const itemType = urlParams.get('type') || 'lead';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callPicked, setCallPicked] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [expandedCalls, setExpandedCalls] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [dynamicFormSubmitted, setDynamicFormSubmitted] = useState(false);
  const [dynamicFormSubmission, setDynamicFormSubmission] = useState(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  const [formData, setFormData] = useState({
    selectedService: '',
    serviceSubcategory: '',
    serviceProvider: '',
    status: 'pending',
    remarks: ''
  });

  useEffect(() => {
    const initializePage = async () => {
      await loadData();
      await checkDynamicFormSubmission();
      
      // Check if there's an active call session for this lead/application
      if (isCallSessionActive && sessionData && sessionData.leadId === leadId) {
        console.log('Restoring active call session for lead:', leadId);
        console.log('Session data:', sessionData);
        
        // Restore the call state
        setIsCallActive(true);
        
        // Restore all page state if available
        if (sessionData.pageState) {
          console.log('Restoring page state:', sessionData.pageState);
          
          if (sessionData.pageState.formData) {
            setFormData(sessionData.pageState.formData);
          }
          
          if (sessionData.pageState.callPicked !== undefined) {
            setCallPicked(sessionData.pageState.callPicked);
          }
          
          if (sessionData.pageState.showCallHistory !== undefined) {
            setShowCallHistory(sessionData.pageState.showCallHistory);
          }
          
          if (sessionData.pageState.showSubmissionDetails !== undefined) {
            setShowSubmissionDetails(sessionData.pageState.showSubmissionDetails);
          }
        }
      } else {
        // Auto-start call if startCall query parameter is present
        const shouldStartCall = urlParams.get('startCall');
        if (shouldStartCall === 'true' && !isCallActive) {
          // Small delay to ensure data is loaded
          setTimeout(() => {
            handleStartCall();
          }, 500);
        }
      }
    };
    
    initializePage();
  }, [leadId]);

  useEffect(() => {
    if (formData.selectedService) {
      loadSubcategories(formData.selectedService);
      loadServiceProviders(formData.selectedService, formData.serviceSubcategory);
    }
  }, [formData.selectedService, formData.serviceSubcategory]);

  // Save page state to session whenever it changes during an active call
  useEffect(() => {
    if (isCallActive && isCallSessionActive) {
      const pageState = {
        formData,
        callPicked,
        showCallHistory,
        showSubmissionDetails
      };
      
      console.log('Saving page state to session:', pageState);
      updateCallSessionState(pageState);
    }
  }, [isCallActive, formData, callPicked, showCallHistory, showSubmissionDetails]);

  // Prevent tab close during active call
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isCallActive) {
        e.preventDefault();
        e.returnValue = 'You have an active call session. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (isCallActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isCallActive]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      let lead, servicesData;

      if (itemType === 'application') {
        // Load application data and convert to lead-like format
        const applicationService = await import('@/services/applicationService');
        const [appResponse, services] = await Promise.all([
          applicationService.default.getApplication(leadId),
          callingService.getServices()
        ]);

        if (appResponse.success) {
          // Convert application to lead-like format
          const app = appResponse.data;
          lead = {
            _id: app._id,
            id: app._id,
            name: app.fullName,
            contactNo: app.mobileNumber,
            email: app.email || '',
            selectedService: app.serviceType === 'credit-card' ? 'Credit Card' :
              app.serviceType === 'insurance' ? 'Insurance' :
                app.serviceType === 'loan' ? 'Personal Loan' : app.serviceType,
            serviceSubcategory: app.subType || '',
            serviceProvider: null,
            status: app.status || 'pending',
            priority: 'medium',
            remarks: '',
            callHistory: app.callHistory || [],
            // Add application-specific fields
            applicationId: app.applicationId,
            panNumber: app.panNumber,
            dateOfBirth: app.dateOfBirth,
            location: app.location,
            isApplication: true
          };
        }
        servicesData = services;
      } else {
        // Load lead data normally
        [lead, servicesData] = await Promise.all([
          callingService.getLeadById(leadId),
          callingService.getServices()
        ]);
      }

      setCurrentLead(lead);
      setServices(servicesData);

      // Load call history separately with error handling (for both leads and applications)
      try {
        const callHistoryData = await callingService.getLeadCallHistory(leadId);
        console.log('Call history data received:', callHistoryData);
        console.log('Call stats:', callHistoryData.callStats);
        console.log('Call history array:', callHistoryData.callStats?.callHistory);
        setCallHistory(callHistoryData.callStats || {});
      } catch (historyError) {
        console.error('Failed to load call history:', historyError);
        setCallHistory({});
      }

      setFormData({
        selectedService: lead.selectedService || '',
        serviceSubcategory: lead.serviceSubcategory || '',
        serviceProvider: (typeof lead.serviceProvider === 'object' && lead.serviceProvider?.id)
          ? lead.serviceProvider.id
          : lead.serviceProvider || '',
        status: lead.status || 'pending',
        remarks: lead.remarks || ''
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      setErrors({ general: 'Failed to load data' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubcategories = async (serviceName) => {
    try {
      // Import service master service
      const serviceMasterService = await import('@/services/serviceMasterService');
      
      // Get all service types
      const typesResponse = await serviceMasterService.default.getServiceTypes({ isActive: true });
      const serviceType = typesResponse.data?.find(st => st.name === serviceName);
      
      if (serviceType) {
        // Get subcategories for this service type
        const subcatsResponse = await serviceMasterService.default.getSubcategories({ 
          serviceType: serviceType._id,
          isActive: true 
        });
        setSubcategories(subcatsResponse.data || []);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const loadServiceProviders = async (serviceName, subcategoryName = null) => {
    try {
      // Import service master service
      const serviceMasterService = await import('@/services/serviceMasterService');
      
      // Get all service types and providers
      const [typesResponse, providersResponse] = await Promise.all([
        serviceMasterService.default.getServiceTypes({ isActive: true }),
        serviceMasterService.default.getServiceProviders({ isActive: true })
      ]);
      
      const serviceType = typesResponse.data?.find(st => st.name === serviceName);
      
      if (serviceType && providersResponse.data) {
        // Filter providers that offer this service type
        let filteredProviders = providersResponse.data.filter(provider => {
          return provider.serviceOfferings?.some(offering => {
            const offeringTypeId = offering.serviceType?._id || offering.serviceType;
            return offeringTypeId === serviceType._id;
          });
        });
        
        // If subcategory is selected, further filter providers
        if (subcategoryName && formData.serviceSubcategory) {
          const subcatsResponse = await serviceMasterService.default.getSubcategories({ 
            serviceType: serviceType._id,
            isActive: true 
          });
          const selectedSubcat = subcatsResponse.data?.find(sc => sc.name === subcategoryName);
          
          if (selectedSubcat) {
            filteredProviders = filteredProviders.filter(provider => {
              return provider.serviceOfferings?.some(offering => {
                const offeringTypeId = offering.serviceType?._id || offering.serviceType;
                if (offeringTypeId === serviceType._id) {
                  // If offering has no subcategories, it means "all"
                  if (!offering.subcategories || offering.subcategories.length === 0) {
                    return true;
                  }
                  // Check if this specific subcategory is offered
                  return offering.subcategories.some(subId => {
                    const subcatId = subId._id || subId;
                    return subcatId === selectedSubcat._id;
                  });
                }
                return false;
              });
            });
          }
        }
        
        setProviders(filteredProviders);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      setProviders([]);
    }
  };

  const handleStartCall = async () => {
    try {
      console.log('Starting call for:', itemType, leadId);

      // Store the current route for navigation back
      const currentRoute = window.location.pathname + window.location.search;
      
      // Prepare initial page state
      const initialPageState = {
        formData,
        callPicked: null,
        showCallHistory,
        showSubmissionDetails
      };

      if (itemType === 'application') {
        // For applications, call backend to start call and create call history entry
        console.log('Calling callingService.startCall for application...');
        const response = await callingService.startCall(leadId);
        console.log('Start call response:', response);

        // Set UI state
        setIsCallActive(true);
        setCallPicked(null);
        setErrors({});
        
        // Start call session in store with route and initial state
        startCallSession(leadId, currentRoute, initialPageState);
        
        console.log('Application call started successfully');

        // Reload data to get updated call history
        setTimeout(() => {
          console.log('Reloading data to get call history...');
          loadData();
        }, 1000);
      } else {
        // For leads, call backend to start call and create call history entry
        console.log('Calling callingService.startCall...');
        const response = await callingService.startCall(leadId);
        console.log('Start call response:', response);

        // Set UI state
        setIsCallActive(true);
        setCallPicked(null);
        setErrors({});

        // Start call session in store with route and initial state
        startCallSession(leadId, currentRoute, initialPageState);

        console.log('Lead call started successfully, UI state updated');

        // Reload data to get updated call history
        setTimeout(() => {
          console.log('Reloading data to get call history...');
          loadData();
        }, 1000);
      }

    } catch (error) {
      console.error('Error starting call:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrors({ general: 'Failed to start call. Please try again.' });
    }
  };

  const handleEndCall = async () => {
    if (!isCallActive) return;

    try {
      setIsSaving(true);
      setErrors({});

      // Save all form data to backend including call picked status
      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider,
        callPicked: callPicked // Include the picked status
      };

      console.log('Ending call and saving data:', updateData);

      // Use endCall endpoint which will save the data
      const response = await callingService.endCall(leadId, updateData);
      console.log('End call response:', response);

      // End call session in store FIRST (this clears the indicator)
      console.log('Calling endCallSession to clear store state...');
      endCallSession();
      console.log('endCallSession completed');

      // Then update local state
      setIsCallActive(false);

      // Reload data to reflect changes (including call history)
      await loadData();

      // Show success message
      setErrors({ success: 'Call ended and lead updated successfully!' });
      setTimeout(() => setErrors({}), 3000);

    } catch (error) {
      console.error('End call error:', error);
      setErrors({ general: 'Failed to end call and save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider
      };

      console.log('Saving data:', updateData, 'Type:', itemType);

      const response = await callingService.updateLead(leadId, updateData, itemType);
      console.log('Save response:', response);

      // Reload data to reflect changes
      await loadData();

      // Show success message briefly
      const itemLabel = itemType === 'application' ? 'Application' : 'Lead';
      setErrors({ success: `${itemLabel} updated successfully!` });
      setTimeout(() => setErrors({}), 3000);

    } catch (error) {
      console.error('Save error:', error);
      setErrors({ general: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      // First save the current lead
      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider
      };

      console.log('Saving data:', updateData, 'Type:', itemType);
      await callingService.updateLead(leadId, updateData, itemType);

      // Get next assigned lead/application
      console.log('Fetching next assigned item...');
      console.log('Current ID:', leadId);
      console.log('Item Type:', itemType);
      const nextLeadResponse = await callingService.getNextAssignedLead(leadId, itemType);
      console.log('Next item response:', nextLeadResponse);
      
      if (nextLeadResponse.success && nextLeadResponse.data) {
        const nextLeadId = nextLeadResponse.data._id || nextLeadResponse.data.id;
        console.log('Navigating to next item:', nextLeadId, 'Type:', itemType);
        
        // Navigate to next lead/application - preserve the type
        const queryParam = itemType === 'application' ? '?type=application' : '';
        navigate(`/calling/lead/${nextLeadId}${queryParam}`);
      } else {
        // No more leads/applications
        const itemLabel = itemType === 'application' ? 'Application' : 'Lead';
        setErrors({ success: `${itemLabel} saved! No more assigned ${itemLabel.toLowerCase()}s available.` });
        setTimeout(() => {
          navigate(itemType === 'application' ? '/dashboard/my-application-queue' : '/dashboard/my-calls');
        }, 2000);
      }

    } catch (error) {
      console.error('Save and next error:', error);
      
      if (error.response?.status === 404) {
        // No more leads/applications available
        const itemLabel = itemType === 'application' ? 'Application' : 'Lead';
        setErrors({ success: `${itemLabel} saved! No more assigned ${itemLabel.toLowerCase()}s available.` });
        setTimeout(() => {
          navigate(itemType === 'application' ? '/dashboard/my-application-queue' : '/dashboard/my-calls');
        }, 2000);
      } else {
        const itemLabel = itemType === 'application' ? 'application' : 'lead';
        setErrors({ general: `Failed to save and navigate to next ${itemLabel}. Please try again.` });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReassignToAdmin = async () => {
    try {
      setIsReassigning(true);
      setErrors({});

      console.log(`Reassigning ${itemType} to admin with reason:`, reassignReason);
      const response = await callingService.reassignToAdmin(leadId, reassignReason, itemType);

      if (response.success) {
        setErrors({ success: `${itemType === 'application' ? 'Application' : 'Lead'} reassigned to admin successfully!` });
        setShowReassignModal(false);
        setReassignReason('');
        
        // Navigate back to calling queue after 1.5 seconds
        setTimeout(() => {
          navigate(itemType === 'application' ? '/dashboard/my-application-queue' : '/dashboard/my-calls');
        }, 1500);
      }

    } catch (error) {
      console.error('Reassign error:', error);
      setErrors({ general: `Failed to reassign ${itemType} to admin. Please try again.` });
    } finally {
      setIsReassigning(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-save after 2 seconds of no changes (debounced)
    if (!isCallActive) {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }
  };

  const handleAutoSave = async () => {
    try {
      setIsAutoSaving(true);

      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider
      };

      await callingService.updateLead(leadId, updateData);
      console.log('Auto-saved lead data');

      // Show brief auto-save indicator
      setTimeout(() => setIsAutoSaving(false), 1000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setIsAutoSaving(false);
    }
  };

  const getSelectedProvider = () => providers.find(p => p.id === formData.serviceProvider);

  const toggleCallExpansion = (callIndex) => {
    const newExpanded = new Set(expandedCalls);
    if (newExpanded.has(callIndex)) {
      newExpanded.delete(callIndex);
    } else {
      newExpanded.add(callIndex);
    }
    setExpandedCalls(newExpanded);
  };



  const checkDynamicFormSubmission = async () => {
    try {
      const response = await dynamicFormService.checkSubmission(leadId);
      setDynamicFormSubmitted(response.hasSubmission);
      
      if (response.hasSubmission) {
        // Load the actual submission data
        const submissionResponse = await dynamicFormService.getSubmissionByLeadId(leadId);
        if (submissionResponse.success) {
          setDynamicFormSubmission(submissionResponse.data);
        }
      }
    } catch (error) {
      console.error('Error checking dynamic form submission:', error);
      // Check localStorage as fallback
      const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      const hasSubmission = submissions.some(sub => sub.leadId === leadId);
      setDynamicFormSubmitted(hasSubmission);
    }
  };

  const getServiceIcon = (serviceName) => {
    if (serviceName?.toLowerCase().includes('credit')) return CreditCard;
    if (serviceName?.toLowerCase().includes('loan')) return Building;
    if (serviceName?.toLowerCase().includes('insurance')) return Shield;
    return Building;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-blue-500 absolute top-0"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h2>
          <p className="text-gray-600 mb-4">The requested lead could not be found.</p>
          <button
            onClick={() => navigate('/dashboard/my-calls')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Calling Queue
          </button>
        </div>
      </div>
    );
  }

  const ServiceIcon = getServiceIcon(currentLead.selectedService);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Left Section - Compact */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(itemType === 'application' ? '/dashboard/my-application-queue' : '/dashboard/my-calls')}
                className="flex items-center px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                title={itemType === 'application' ? 'Back to Application Queue' : 'Back to My Calling Queue'}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="h-6 w-px bg-gray-200"></div>
              
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 leading-tight">
                    {currentLead.name}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {itemType === 'application' ? 'App' : 'Lead'} • {currentLead?.applicationId || leadId?.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Compact Buttons */}
            <div className="flex items-center gap-2">
              {/* Auto-save indicator */}
              {isAutoSaving && (
                <div className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Saving
                </div>
              )}

              {/* CIBIL */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors"
                title="Check CIBIL Score"
              >
                <Shield className="h-3.5 w-3.5 mr-1" />
                CIBIL
              </a>

              {/* Form */}
              <div className="relative">
                <button
                  onClick={() => setShowFormBuilder(true)}
                  className="flex items-center px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Form
                </button>
                {dynamicFormSubmitted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                    <CheckCircle className="h-2.5 w-2.5 text-white ml-0.5 mt-0.5" />
                  </div>
                )}
              </div>

              {/* Reassign */}
              <button
                onClick={() => setShowReassignModal(true)}
                className="flex items-center px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
                title="Reassign"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                Reassign
              </button>

              {/* Call Button */}
              {!isCallActive ? (
                <ActionButton
                  module="calling_employee"
                  action="start_call"
                  label="Call"
                  icon={<Phone className="h-3.5 w-3.5 mr-1" />}
                  onClick={handleStartCall}
                  className="bg-green-500 text-white hover:bg-green-600 text-xs px-3 py-1.5 rounded-lg"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    <span className="text-xs font-medium">Active</span>
                  </div>
                  <ActionButton
                    module="calling_employee"
                    action="end_call"
                    label="End"
                    icon={isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <PhoneOff className="h-3.5 w-3.5 mr-1" />}
                    onClick={handleEndCall}
                    disabled={isSaving}
                    className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-xs px-3 py-1.5 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Compact Alert Messages */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800 font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        {errors.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-800 font-medium">{errors.success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Compact Lead Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Compact Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold flex items-center">
                    <User className="h-4 w-4 mr-1.5" />
                    Contact Info
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    formData.status === 'completed' ? 'bg-green-400 text-white' :
                    formData.status === 'pending' ? 'bg-yellow-400 text-gray-900' :
                    formData.status === 'failed' ? 'bg-red-400 text-white' :
                    formData.status === 'in_progress' ? 'bg-blue-400 text-white' :
                    'bg-white/20 text-white'
                  }`}>
                    {formData.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Compact Body */}
              <div className="p-4 space-y-3">
                <div className="pb-2 border-b border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                  <p className="text-sm font-semibold text-gray-900">{currentLead.name}</p>
                </div>

                <div className="pb-2 border-b border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone</label>
                  <PhoneLink phone={currentLead.contactNo} className="text-sm font-semibold" />
                </div>

                {currentLead.email && (
                  <div className="pb-2 border-b border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                    <EmailLink email={currentLead.email} className="text-xs font-medium" />
                  </div>
                )}

                {currentLead.isApplication && currentLead.panNumber && (
                  <div className="pb-2 border-b border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PAN</label>
                    <p className="text-xs font-mono font-bold text-gray-900">{currentLead.panNumber}</p>
                  </div>
                )}

                {currentLead.isApplication && currentLead.location && (
                  <div className="pb-2 border-b border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Location</label>
                    <p className="text-xs font-medium text-gray-900">{currentLead.location}</p>
                  </div>
                )}

                <div className="pb-2 border-b border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Priority</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${
                    currentLead.priority === 'high' ? 'bg-red-100 text-red-700' :
                    currentLead.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      currentLead.priority === 'high' ? 'bg-red-500' :
                      currentLead.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    {currentLead.priority?.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Service</label>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                      <ServiceIcon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{currentLead.selectedService}</p>
                  </div>
                </div>
              </div>

              {/* Reassigned Info */}
              {currentLead.reassignedBy && (
                <div className="mx-4 mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Reassigned By</label>
                  <p className="text-xs font-semibold text-orange-900">
                    {typeof currentLead.reassignedBy === 'object' 
                      ? `${currentLead.reassignedBy.firstName} ${currentLead.reassignedBy.lastName}`
                      : 'Unknown'}
                  </p>
                  {currentLead.reassignedAt && (
                    <p className="text-[10px] text-orange-600 mt-0.5">
                      {new Date(currentLead.reassignedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-3">
            {/* Dynamic Form Submission - Compact */}
            {dynamicFormSubmitted && dynamicFormSubmission && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header - Compact */}
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowSubmissionDetails(!showSubmissionDetails)}
                      className="flex items-center text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                      Custom Form Submitted
                      <svg
                        className={`ml-1.5 h-3 w-3 transition-transform ${showSubmissionDetails ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-600">
                        {new Date(dynamicFormSubmission.submittedAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        dynamicFormSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                        dynamicFormSubmission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        dynamicFormSubmission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dynamicFormSubmission.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {showSubmissionDetails && (
                  <div className="p-3">
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-600 mb-2">
                        {new Date(dynamicFormSubmission.submittedAt).toLocaleString()}
                      </p>
                      
                      {/* Form Fields - Ultra Compact */}
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-800 mb-1">Form Data</h4>
                        <div className="border border-gray-200 rounded overflow-hidden">
                          {dynamicFormSubmission.formFields?.map((field, index) => (
                            <div 
                              key={index} 
                              className={`flex items-center py-1 px-2 hover:bg-gray-50 transition-colors ${
                                index !== dynamicFormSubmission.formFields.length - 1 ? 'border-b border-gray-100' : ''
                              }`}
                            >
                              <span className="text-[10px] font-medium text-gray-600 w-[100px] flex-shrink-0">
                                {field.fieldLabel}{field.required && <span className="text-red-500">*</span>}:
                              </span>
                              <span className="text-[10px] text-gray-900 font-semibold flex-1 px-1.5">
                                {field.fieldType === 'checkbox' ? (
                                  <span className={field.fieldValue ? 'text-green-600' : 'text-gray-400'}>
                                    {field.fieldValue ? '✓' : '✗'}
                                  </span>
                                ) : field.fieldType === 'file' ? (
                                  <span className="flex items-center text-blue-600">
                                    <FileText className="h-2.5 w-2.5 mr-0.5" />
                                    {field.fieldValue?.name || field.fieldValue || 'File'}
                                  </span>
                                ) : field.fieldValue ? (
                                  field.fieldValue
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </span>
                              <span className="text-[8px] text-gray-400 px-1 py-0.5 bg-gray-100 rounded">
                                {field.fieldType}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metadata - Compact */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-[10px] font-bold text-gray-800 mb-1.5">Info</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-[9px] font-medium text-gray-500 uppercase mb-0.5">Fields</div>
                            <div className="text-xs font-semibold text-gray-900">
                              {dynamicFormSubmission.formFields?.length || 0}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-[9px] font-medium text-gray-500 uppercase mb-0.5">IP</div>
                            <div className="text-[10px] font-semibold text-gray-900">
                              {dynamicFormSubmission.ipAddress || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Notes */}
                      {dynamicFormSubmission.reviewNotes && (
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                          <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Review Notes</div>
                          <div className="text-sm text-blue-900">
                            {dynamicFormSubmission.reviewNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Call History - Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Call History Header - Compact */}
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowCallHistory(!showCallHistory)}
                    className="flex items-center text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Call History ({callHistory.totalCalls || 0} calls)
                    <svg
                      className={`ml-2 h-4 w-4 transition-transform ${showCallHistory ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Quick Stats */}
                    {callHistory.totalCalls > 0 && (
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          {callHistory.pickedCalls}
                        </span>
                        <span className="flex items-center text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                          {callHistory.notPickedCalls}
                        </span>
                        <span className="text-gray-500">
                          {Math.floor((callHistory.totalDuration || 0) / 60)}m total
                        </span>
                      </div>
                    )}

                    <button
                      onClick={loadData}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Call History Content - Collapsible */}
              {showCallHistory && (
                <div className="p-6">
                  {callHistory.callHistory && callHistory.callHistory.length > 0 ? (
                    <>
                      {/* Call Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{callHistory.totalCalls}</div>
                          <div className="text-sm text-blue-700">Total Calls</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{callHistory.pickedCalls}</div>
                          <div className="text-sm text-green-700">Picked Up</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{callHistory.notPickedCalls}</div>
                          <div className="text-sm text-red-700">Not Picked</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{Math.floor((callHistory.totalDuration || 0) / 60)}m</div>
                          <div className="text-sm text-purple-700">Total Duration</div>
                        </div>
                      </div>

                      {/* Call History List */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Call History Details</h4>
                        {callHistory.callHistory.map((call, index) => {
                          const isExpanded = expandedCalls.has(index);
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                              {/* Collapsed Header - Always Visible */}
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleCallExpansion(index)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${call.picked === true ? 'bg-green-100' :
                                      call.picked === false ? 'bg-red-100' : 'bg-gray-100'
                                      }`}>
                                      {call.picked === true ? (
                                        <Phone className="w-4 h-4 text-green-600" />
                                      ) : call.picked === false ? (
                                        <PhoneOff className="w-4 h-4 text-red-600" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 flex items-center">
                                        Call #{callHistory.callHistory.length - index}
                                        {call.picked === true && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Phone className="w-3 h-3 mr-1" />
                                            Picked
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {new Date(call.callTime).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })} at {new Date(call.callTime).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    {/* Quick Status */}
                                    <div className="text-right">
                                      <div className={`text-sm font-medium ${call.picked === true ? 'text-green-600' :
                                        call.picked === false ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {call.picked === true ? 'Answered' :
                                          call.picked === false ? 'Not Answered' : 'Attempted'}
                                      </div>
                                      {call.duration > 0 && (
                                        <div className="text-xs text-gray-500">
                                          {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                        </div>
                                      )}
                                    </div>

                                    {/* Expand/Collapse Icon */}
                                    <svg
                                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Details - Show on Demand */}
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  <div className="pt-4 space-y-4">
                                    {/* Detailed Time Information */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Call Timeline</div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Started:</span>
                                          <div className="text-gray-900">
                                            {new Date(call.callTime).toLocaleDateString('en-US', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </div>
                                          <div className="text-gray-600">
                                            {new Date(call.callTime).toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit'
                                            })}
                                          </div>
                                        </div>
                                        {call.callEndTime && (
                                          <div>
                                            <span className="font-medium text-gray-700">Ended:</span>
                                            <div className="text-gray-600">
                                              {new Date(call.callEndTime).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Call Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Call Status</div>
                                        <div className={`text-sm font-semibold ${call.picked === true ? 'text-green-600' :
                                          call.picked === false ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                          {call.picked === true ? '✓ Call Answered' :
                                            call.picked === false ? '✗ Not Answered' : '⏳ Call Attempted'}
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                          {call.duration > 0 ? (
                                            <>
                                              {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                              <span className="text-xs text-gray-500 ml-1">({call.duration}s total)</span>
                                            </>
                                          ) : (
                                            <span className="text-gray-500">No duration</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Outcome</div>
                                        <div>
                                          {call.outcome ? (
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                              call.outcome === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                              call.outcome === 'interested' ? 'bg-green-100 text-green-800' :
                                              call.outcome === 'not_interested' ? 'bg-red-100 text-red-800' :
                                              call.outcome === 'number_off' ? 'bg-gray-100 text-gray-800' :
                                              call.outcome === 'disconnect_call' ? 'bg-orange-100 text-orange-800' :
                                              call.outcome === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                                              call.outcome === 'another_call' ? 'bg-purple-100 text-purple-800' :
                                              call.outcome === 'no_income' ? 'bg-red-100 text-red-800' :
                                              call.outcome === 'call_back' ? 'bg-cyan-100 text-cyan-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {call.outcome.replace('_', ' ').charAt(0).toUpperCase() + call.outcome.replace('_', ' ').slice(1)}
                                            </span>
                                          ) : (
                                            <span className="text-gray-500 text-sm">No outcome recorded</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Call Notes */}
                                    {call.notes ? (
                                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                        <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Call Notes</div>
                                        <div className="text-sm text-blue-900 leading-relaxed">
                                          {call.notes}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <span className="text-xs text-gray-500 italic">No notes recorded for this call</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No calls made yet</p>
                      <p className="text-sm text-gray-400 mt-1">Call history will appear here after making calls</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Compact Call Status */}
            {isCallActive && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 text-green-600 mr-2" />
                    Call Status
                  </h3>
                  <div className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`group relative cursor-pointer p-3 border-2 rounded-lg transition-all ${
                    callPicked === true
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <input
                      type="radio"
                      name="callPicked"
                      checked={callPicked === true}
                      onChange={() => setCallPicked(true)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${
                        callPicked === true ? 'bg-green-500' : 'bg-gray-100'
                        }`}>
                        <Phone className={`h-4 w-4 ${callPicked === true ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <span className={`block text-sm font-bold ${callPicked === true ? 'text-green-700' : 'text-gray-700'}`}>
                          Answered
                        </span>
                        <p className={`text-xs ${callPicked === true ? 'text-green-600' : 'text-gray-500'}`}>
                          Call picked up
                        </p>
                      </div>
                      {callPicked === true && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </label>

                  <label className={`group relative cursor-pointer p-3 border-2 rounded-lg transition-all ${
                    callPicked === false
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                    }`}>
                    <input
                      type="radio"
                      name="callPicked"
                      checked={callPicked === false}
                      onChange={() => setCallPicked(false)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${
                        callPicked === false ? 'bg-red-500' : 'bg-gray-100'
                        }`}>
                        <PhoneOff className={`h-4 w-4 ${callPicked === false ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <span className={`block text-sm font-bold ${callPicked === false ? 'text-red-700' : 'text-gray-700'}`}>
                          No Answer
                        </span>
                        <p className={`text-xs ${callPicked === false ? 'text-red-600' : 'text-gray-500'}`}>
                          Not answered
                        </p>
                      </div>
                      {callPicked === false && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Service Details */}
            {(callPicked === true || !isCallActive) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center mb-3">
                  <ServiceIcon className="h-4 w-4 text-blue-600 mr-2" />
                  Service Management
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Type</label>
                    <select
                      value={formData.selectedService}
                      onChange={(e) => handleChange('selectedService', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Service</option>
                      {services && services.length > 0 ? (
                        services.map((service) => (
                          <option key={service._id || service.id} value={service.name}>
                            {service.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No services available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="unassigned">Unassigned</option>
                      <option value="assigned">Assigned</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="number_off">Number Off</option>
                      <option value="disconnect_call">Disconnect Call</option>
                      <option value="busy">Busy</option>
                      <option value="another_call">Another Call</option>
                      <option value="no_income">No Income</option>
                      <option value="call_back">Call Back</option>
                      <option value="interested">Interested</option>
                      <option value="completed">Completed</option>
                      <option value="reassigned">Reassigned</option>
                    </select>
                  </div>

                  {subcategories.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subcategory</label>
                      <select
                        value={formData.serviceSubcategory}
                        onChange={(e) => handleChange('serviceSubcategory', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((sub) => (
                          <option key={sub.name} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {providers.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Provider</label>
                      <select
                        value={formData.serviceProvider}
                        onChange={(e) => handleChange('serviceProvider', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">Select Provider</option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Provider Website */}
                {getSelectedProvider()?.website && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-blue-900">{getSelectedProvider().name}</h4>
                            {getSelectedProvider().rating && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">
                                {getSelectedProvider().rating} ⭐
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-700">Visit official website</p>
                        </div>
                      </div>
                      <WebsiteLink
                        url={getSelectedProvider().website}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        showIcon={false}
                      >
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        Visit
                      </WebsiteLink>
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Remarks & Notes
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes, feedback, or follow-up requirements..."
                  />
                </div>

                {/* Save Buttons */}
                {!isCallActive && (
                  <div className="mt-4 flex justify-end gap-2">
                    <ActionButton
                      module="calling_employee"
                      action="update_status"
                      label="Save"
                      icon={isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 text-sm px-4 py-2 rounded-lg"
                    />
                    <ActionButton
                      module="calling_employee"
                      action="update_status"
                      label="Save & Next"
                      icon={isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : (
                        <>
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                      onClick={handleSaveAndNext}
                      disabled={isSaving}
                      className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 text-sm px-4 py-2 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Calling Form */}
            {(callPicked === true || !isCallActive) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-purple-600" />
                  Additional Information
                </h3>
                <CallingFormRenderer 
                  leadId={leadId}
                  onDataChange={(data) => console.log('Form data changed:', data)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Builder Modal */}
      <FormBuilderModal
        isOpen={showFormBuilder}
        onClose={() => setShowFormBuilder(false)}
        leadId={leadId}
        leadEmail={currentLead?.email}
        leadName={currentLead?.name}
      />

      {/* Reassign to Admin Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-2 text-orange-600" />
                  Reassign to Admin
                </h3>
                <button
                  onClick={() => {
                    setShowReassignModal(false);
                    setReassignReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to reassign this {itemType === 'application' ? 'application' : 'lead'} back to admin?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  This will unassign the {itemType === 'application' ? 'application' : 'lead'} from you and make it available for admin to reassign.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Reassignment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Please provide a reason for reassigning this lead (e.g., customer not reachable, wrong contact info, requires special handling, etc.)"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReassignModal(false);
                    setReassignReason('');
                  }}
                  disabled={isReassigning}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassignToAdmin}
                  disabled={isReassigning || !reassignReason.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {isReassigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reassigning...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Confirm Reassign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;