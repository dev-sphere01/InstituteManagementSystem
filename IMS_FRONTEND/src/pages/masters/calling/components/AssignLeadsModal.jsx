import { useState } from 'react';
import { EmailLink } from '@/components/common/ContactLinks';
import { FaTimes, FaUserCheck } from 'react-icons/fa';

const AssignLeadsModal = ({ staff, selectedCount, onAssign, onClose, isReassign = false }) => {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    setIsAssigning(true);
    try {
      await onAssign(selectedStaff);
    } catch (error) {
      console.error('Error assigning leads:', error);
      alert('Error assigning leads. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedStaffMember = staff.find(member => member.id === selectedStaff);

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isReassign ? 'Reassign Leads' : 'Assign Leads'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Summary */}
          <div className={`mb-6 p-4 rounded-lg ${isReassign ? 'bg-purple-50' : 'bg-blue-50'}`}>
            <div className="flex items-center">
              <FaUserCheck className={`h-5 w-5 mr-2 ${isReassign ? 'text-purple-600' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${isReassign ? 'text-purple-900' : 'text-blue-900'}`}>
                {isReassign ? 'Reassigning' : 'Assigning'} {selectedCount} lead{selectedCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Staff Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Staff Member *
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role || 'Staff'}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Staff Info */}
          {selectedStaffMember && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Staff:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {selectedStaffMember.name}</p>
                <p><span className="font-medium">Role:</span> {selectedStaffMember.role || 'Staff'}</p>
                {selectedStaffMember.email && (
                  <p><span className="font-medium">Email:</span> <EmailLink email={selectedStaffMember.email} showIcon={false} /></p>
                )}
                {selectedStaffMember.currentLeads !== undefined && (
                  <p><span className="font-medium">Current Leads:</span> {selectedStaffMember.currentLeads}</p>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {isReassign 
                ? 'The selected leads will be reassigned to the new staff member and will appear in their calling queue.'
                : 'Once assigned, the selected leads will be marked as "Assigned" and will appear in the staff member\'s calling queue.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedStaff || isAssigning}
              className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isReassign 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAssigning 
                ? (isReassign ? 'Reassigning...' : 'Assigning...') 
                : `${isReassign ? 'Reassign' : 'Assign'} ${selectedCount} Lead${selectedCount > 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadsModal;
