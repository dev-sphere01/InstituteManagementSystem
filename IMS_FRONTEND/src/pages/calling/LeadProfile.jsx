import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import callingService from '@/services/callingService';
import callingFormService from '@/services/callingFormService';
import { EmailLink, PhoneLink } from '@/components/common/ContactLinks';
import getBaseFileURL from '@/utils/getBaseFileURL';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  CreditCard,
  Shield
} from 'lucide-react';

const LeadProfile = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemType = urlParams.get('type') || 'lead';

  const [lead, setLead] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      let leadData;
      if (itemType === 'application') {
        const applicationService = await import('@/services/applicationService');
        const appResponse = await applicationService.default.getApplication(leadId);
        
        if (appResponse.success) {
          const app = appResponse.data;
          leadData = {
            _id: app._id,
            id: app._id,
            name: app.fullName,
            contactNo: app.mobileNumber,
            email: app.email || '',
            selectedService: app.serviceType,
            serviceSubcategory: app.subType || '',
            status: app.status || 'pending',
            remarks: '',
            applicationId: app.applicationId,
            panNumber: app.panNumber,
            dateOfBirth: app.dateOfBirth,
            location: app.location,
            isApplication: true,
            createdAt: app.createdAt
          };
        }
      } else {
        leadData = await callingService.getLeadById(leadId);
        
        // Load call history
        try {
          const historyData = await callingService.getLeadCallHistory(leadId);
          setCallHistory(historyData.callStats || {});
        } catch (error) {
          console.error('Failed to load call history:', error);
        }
      }

      setLead(leadData);

      // Load calling form data
      try {
        const formResponse = await callingFormService.getFormData(leadId);
        setFormData(formResponse);
      } catch (error) {
        console.log('No form data found');
      }

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceIcon = (service) => {
    if (service?.toLowerCase().includes('credit')) return CreditCard;
    if (service?.toLowerCase().includes('insurance')) return Shield;
    return Building;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      unassigned: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      not_interested: 'bg-red-100 text-red-800',
      number_off: 'bg-gray-100 text-gray-800',
      disconnect_call: 'bg-orange-100 text-orange-800',
      busy: 'bg-yellow-100 text-yellow-800',
      another_call: 'bg-purple-100 text-purple-800',
      no_income: 'bg-red-100 text-red-800',
      call_back: 'bg-cyan-100 text-cyan-800',
      interested: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lead not found</p>
        </div>
      </div>
    );
  }

  const ServiceIcon = getServiceIcon(lead.selectedService);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      {/* Compact Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                {lead.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
                <p className="text-sm text-gray-500">
                  {lead.isApplication ? 'Application' : 'Lead'} Profile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(lead.status)}
              <button
                onClick={() => navigate(`/calling/lead/${leadId}${itemType === 'application' ? '?type=application' : ''}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit / Call
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar - Quick Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-blue-600" />
              Contact
            </h3>
            <div className="space-y-2">
              <PhoneLink phone={lead.contactNo} className="text-sm" />
              {lead.email && (
                <EmailLink email={lead.email} className="text-sm" />
              )}
              {lead.location && (
                <p className="text-sm text-gray-600">{lead.location}</p>
              )}
            </div>
          </div>

          {/* Service Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <ServiceIcon className="h-4 w-4 mr-2 text-purple-600" />
              Service
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-900">{lead.selectedService}</p>
              </div>
              {lead.serviceSubcategory && (
                <div>
                  <p className="text-xs text-gray-500">Subcategory</p>
                  <p className="text-sm text-gray-900">{lead.serviceSubcategory}</p>
                </div>
              )}
              {lead.applicationId && (
                <div>
                  <p className="text-xs text-gray-500">App ID</p>
                  <p className="text-sm font-mono text-gray-900">{lead.applicationId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Card */}
          {(lead.panNumber || lead.dateOfBirth) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-green-600" />
                Details
              </h3>
              <div className="space-y-2">
                {lead.panNumber && (
                  <div>
                    <p className="text-xs text-gray-500">PAN</p>
                    <p className="text-sm font-mono text-gray-900">{lead.panNumber}</p>
                  </div>
                )}
                {lead.dateOfBirth && (
                  <div>
                    <p className="text-xs text-gray-500">DOB</p>
                    <p className="text-sm text-gray-900">{new Date(lead.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-600" />
              Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              {lead.assignedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Assigned</span>
                  <span className="text-gray-900">{new Date(lead.assignedAt).toLocaleDateString()}</span>
                </div>
              )}
              {lead.lastCallAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Last Call</span>
                  <span className="text-gray-900">{new Date(lead.lastCallAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Call History */}
          {!lead.isApplication && callHistory.callHistory && callHistory.callHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                Call History ({callHistory.totalCalls})
              </h3>
              <div className="space-y-2">
                {callHistory.callHistory.map((call, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {call.picked ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {call.picked ? 'Answered' : 'Not Answered'}
                        </span>
                        {call.duration > 0 && (
                          <span className="text-xs text-gray-500">
                            • {Math.floor(call.duration / 60)}m {call.duration % 60}s
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(call.callTime).toLocaleString()}
                      </span>
                    </div>
                    {call.outcome && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">
                        {call.outcome.replace('_', ' ')}
                      </span>
                    )}
                    {call.notes && (
                      <p className="text-sm text-gray-600 mt-2 pl-6">{call.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calling Form Data */}
          {formData && formData.formFields && formData.formFields.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.formFields.map((field, index) => {
                  const getFileIcon = (filePath) => {
                    const ext = filePath?.split('.').pop()?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                      return (
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      );
                    } else if (['pdf'].includes(ext)) {
                      return (
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      );
                    } else {
                      return (
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      );
                    }
                  };

                  const renderFieldValue = () => {
                    if (field.fieldType === 'checkbox') {
                      return field.fieldValue ? 'Yes' : 'No';
                    } else if (field.fieldType === 'file' && field.fieldValue) {
                      const baseFileUrl = getBaseFileURL();
                      const cleanPath = field.fieldValue.startsWith('/') ? field.fieldValue : `/${field.fieldValue}`;
                      const fileUrl = field.fieldValue.startsWith('http') 
                        ? field.fieldValue 
                        : `${baseFileUrl}${cleanPath}`;
                      
                      return (
                        <button
                          onClick={() => window.open(fileUrl, '_blank')}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {getFileIcon(field.fieldValue)}
                          <span className="text-sm">View File</span>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      );
                    } else {
                      return field.fieldValue || '-';
                    }
                  };

                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{field.fieldLabel}</p>
                      <div className="text-sm font-medium text-gray-900">
                        {renderFieldValue()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Updated: {new Date(formData.updatedAt || formData.submittedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-600" />
                Additional Information
              </h3>
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No additional data available</p>
              </div>
            </div>
          )}

          {/* Remarks */}
          {lead.remarks && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Remarks</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadProfile;
