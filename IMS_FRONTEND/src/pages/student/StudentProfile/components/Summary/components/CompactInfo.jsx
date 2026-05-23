import React, { useState } from 'react'
import { useNotification } from '../../../../../../services/NotificationService'
import API from '../../../../../../services/API'

const statusOptions = [
    'Prospect',
    'Applied',
    'Admitted',
    'Active',
    'Inactive',
    'Dropped',
    'Completed'
]

const CompactInfo = ({student}) => {
    const notify = useNotification();
    const [status, setStatus] = useState(student.studentStatus || 'Applied');
    const [updating, setUpdating] = useState(false);

    const updateStatus = async () => {
        if (!student?._id) return;
        setUpdating(true);
        try {
            await API.patch(`/admissions/${student._id}/status`, {
                status,
                source: 'student-profile'
            });
            notify('Student status updated', 'success');
        } catch (error) {
            notify('Failed to update status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                    ??
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">DOB</p>
                    <p className="font-semibold text-slate-800 text-sm">
                        {new Date(student.dob).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50 border border-green-100">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                    ??
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">
                        Contact
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">
                        {student.contactNumber}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                    ?
                </div>
                <div className="w-full">
                    <p className="text-xs text-slate-500 font-medium">Student Status</p>
                    <select
                        className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1 text-xs font-semibold text-purple-700"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <button
                        className="mt-2 w-full rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                        onClick={updateStatus}
                        disabled={updating}
                    >
                        {updating ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CompactInfo
