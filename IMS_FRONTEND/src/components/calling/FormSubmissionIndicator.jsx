import { useState } from 'react';
import {
  CheckCircle,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Info,
  X,
  File
} from 'lucide-react';

const FormSubmissionIndicator = ({ submission }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!submission || !submission.submittedAt) {
    return null;
  }

  const { data, documents, submittedAt, status } = submission;
  const summary = submission.summary || {};

  // Count filled fields
  const filledFieldsCount = Object.keys(summary.fields || {}).length;
  const documentsCount = documents?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Form Submitted</h3>
            <p className="text-sm text-gray-500">
              {new Date(submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
        >
          <Info className="h-4 w-4 mr-1" />
          {showDetails ? 'Hide' : 'View'} Details
        </button>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{filledFieldsCount}</div>
          <div className="text-xs text-blue-700">Fields Filled</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{documentsCount}</div>
          <div className="text-xs text-purple-700">Documents</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${status === 'submitted' ? 'bg-green-100 text-green-800' :
            status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
              status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Status</div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
          {/* Submitted Data */}
          {data && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Submitted Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.fullName && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Full Name</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{data.fullName}</div>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{data.email}</div>
                    </div>
                  </div>
                )}
                {data.alternatePhone && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Alternate Phone</div>
                      <div className="text-sm font-medium text-gray-900">{data.alternatePhone}</div>
                    </div>
                  </div>
                )}
                {data.dateOfBirth && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Date of Birth</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(data.dateOfBirth).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                {data.panNumber && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">PAN Number</div>
                      <div className="text-sm font-medium text-gray-900">{data.panNumber}</div>
                    </div>
                  </div>
                )}
                {data.aadharNumber && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Aadhar Number</div>
                      <div className="text-sm font-medium text-gray-900">{data.aadharNumber}</div>
                    </div>
                  </div>
                )}
                {(data.address || data.city || data.state || data.pincode) && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="text-sm font-medium text-gray-900">
                        {[data.address, data.city, data.state, data.pincode].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
                {data.occupation && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Occupation</div>
                      <div className="text-sm font-medium text-gray-900">{data.occupation}</div>
                    </div>
                  </div>
                )}
                {data.monthlyIncome && (
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Monthly Income</div>
                      <div className="text-sm font-medium text-gray-900">{data.monthlyIncome}</div>
                    </div>
                  </div>
                )}
              </div>
              {data.additionalInfo && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-blue-700 mb-1">Additional Information</div>
                  <div className="text-sm text-blue-900">{data.additionalInfo}</div>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {documents && documents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <File className="h-4 w-4 mr-2 text-purple-600" />
                Uploaded Documents ({documents.length})
              </h4>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <File className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                        <div className="text-xs text-gray-500">
                          {doc.fieldName} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormSubmissionIndicator;
