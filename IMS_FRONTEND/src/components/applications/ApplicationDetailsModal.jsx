import { useState } from 'react';
import {
    FileText,
    Eye,
    XCircle,
    User,
    DollarSign,
    Download
} from 'lucide-react';

export default function ApplicationDetailsModal({ application, onClose }) {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Application Details - {application.applicationId}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    {/* Application Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User size={20} />
                                Personal Information
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div><strong>Full Name:</strong> {application.fullName}</div>
                                <div><strong>PAN Number:</strong> {application.panNumber}</div>
                                <div><strong>Aadhaar Number:</strong> {application.aadhaarNumber}</div>
                                <div><strong>Date of Birth:</strong> {new Date(application.dateOfBirth).toLocaleDateString()}</div>
                                <div><strong>Mobile:</strong> {application.mobileNumber}</div>
                                <div><strong>Location:</strong> {application.location}</div>
                                <div><strong>Address:</strong> {application.currentAddress}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText size={20} />
                                Application Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div><strong>Application ID:</strong> {application.applicationId}</div>
                                <div><strong>Service Type:</strong> {application.serviceType.replace('-', ' ').toUpperCase()}</div>
                                {application.subType && <div><strong>Sub Type:</strong> {application.subType.toUpperCase()}</div>}
                                <div><strong>Status:</strong> {application.status.replace('-', ' ').toUpperCase()}</div>
                                <div><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleString()}</div>
                                {application.reviewedAt && <div><strong>Reviewed:</strong> {new Date(application.reviewedAt).toLocaleString()}</div>}
                                {application.reviewedBy && <div><strong>Reviewed By:</strong> {application.reviewedBy.firstName} {application.reviewedBy.lastName}</div>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign size={20} />
                                Financial Information
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                {application.monthlyIncome && <div><strong>Monthly Income:</strong> ₹{application.monthlyIncome.toLocaleString()}</div>}
                                {application.employmentType && <div><strong>Employment Type:</strong> {application.employmentType.toUpperCase()}</div>}
                                {application.companyName && <div><strong>Company:</strong> {application.companyName}</div>}
                                {application.workExperience && <div><strong>Work Experience:</strong> {application.workExperience} years</div>}
                                {application.creditScore && <div><strong>Credit Score:</strong> {application.creditScore}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Service Specific Details */}
                    {application.serviceType === 'credit-card' && application.selectedCard && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Credit Card Details</h3>
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                <div><strong>Card:</strong> {application.selectedCard.name}</div>
                                <div><strong>Bank:</strong> {application.selectedCard.bank}</div>
                                <div><strong>Limit:</strong> {application.selectedCard.limit}</div>
                                {application.preApproved && <div><strong>Pre-approved:</strong> Yes</div>}
                            </div>
                        </div>
                    )}

                    {application.serviceType === 'insurance' && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Details</h3>
                            <div className="bg-green-50 p-4 rounded-lg space-y-2">
                                {application.coverageAmount && <div><strong>Coverage Amount:</strong> ₹{application.coverageAmount.toLocaleString()}</div>}
                                {application.nomineeDetails && <div><strong>Nominee:</strong> {application.nomineeDetails}</div>}
                                {application.medicalHistory && <div><strong>Medical History:</strong> {application.medicalHistory}</div>}
                                {application.subType === 'vehicle' && (
                                    <>
                                        {application.vehicleNumber && <div><strong>Vehicle Number:</strong> {application.vehicleNumber}</div>}
                                        {application.vehicleModel && <div><strong>Vehicle Model:</strong> {application.vehicleModel}</div>}
                                        {application.vehicleYear && <div><strong>Vehicle Year:</strong> {application.vehicleYear}</div>}
                                    </>
                                )}
                                {application.subType === 'property' && (
                                    <>
                                        {application.propertyType && <div><strong>Property Type:</strong> {application.propertyType}</div>}
                                        {application.propertyValue && <div><strong>Property Value:</strong> ₹{application.propertyValue.toLocaleString()}</div>}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {application.serviceType === 'loan' && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Loan Details</h3>
                            <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                                {application.loanAmount && <div><strong>Loan Amount:</strong> ₹{application.loanAmount.toLocaleString()}</div>}
                                {application.loanPurpose && <div><strong>Loan Purpose:</strong> {application.loanPurpose}</div>}
                                {application.collateral && <div><strong>Collateral:</strong> {application.collateral}</div>}
                                {application.subType === 'business' && (
                                    <>
                                        {application.businessType && <div><strong>Business Type:</strong> {application.businessType}</div>}
                                        {application.businessAge && <div><strong>Business Age:</strong> {application.businessAge} years</div>}
                                        {application.annualTurnover && <div><strong>Annual Turnover:</strong> ₹{application.annualTurnover.toLocaleString()}</div>}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    {application.documents && application.documents.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText size={20} />
                                Uploaded Documents ({application.documents.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {application.documents.map((doc, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-blue-600 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 text-sm">
                                                        {doc.documentType}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {doc.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.isRequired
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {doc.isRequired ? 'Required' : 'Optional'}
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3">
                                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = `http://localhost:4000/uploads/${doc.path}`;
                                                    link.target = '_blank';
                                                    link.rel = 'noopener noreferrer';
                                                    link.click();
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                            >
                                                <Eye size={12} />
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = `http://localhost:4000/uploads/${doc.path}`;
                                                    link.download = doc.name;
                                                    link.click();
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                            >
                                                <Download size={12} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Notes History */}
                    {application.notes && application.notes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes History</h3>
                            <div className="space-y-2">
                                {application.notes.map((note, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            {new Date(note.addedAt).toLocaleString()} - {note.addedBy?.firstName} {note.addedBy?.lastName}
                                        </div>
                                        <div className="text-gray-900">{note.note}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}