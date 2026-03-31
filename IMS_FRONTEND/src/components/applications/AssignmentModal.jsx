import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { useNotification } from '@/services/NotificationService';

export default function AssignmentModal({ applications, staff, onClose, onAssign }) {
    const notify = useNotification();
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedApplications, setSelectedApplications] = useState(applications);

    const handleAssign = () => {
        if (!selectedStaff) {
            notify('Please select a staff member', 'warning');
            return;
        }
        if (selectedApplications.length === 0) {
            notify('Please select at least one application', 'warning');
            return;
        }
        onAssign(selectedApplications, selectedStaff);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/10 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Assign Applications
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Staff Member
                            </label>
                            <select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Choose a staff member...</option>
                                {staff.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} ({member.currentApplications || 0} current applications)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Applications to Assign
                            </label>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {selectedApplications.length} applications selected for assignment
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Assign Applications
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
