import React from 'react'

const CompactInfo = ({student}) => {
    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📅
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
                    📞
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
                    ✅
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">Status</p>
                    <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${student.status === "Active"
                                ? "bg-green-500 text-white"
                                : "bg-yellow-500 text-white"
                            }`}
                    >
                        {student.status || "Pending"}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default CompactInfo