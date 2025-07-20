import React from 'react'

const Fee = ({student,InfoCard,InfoRow}) => {
    return (
        <div className="space-y-4">
            <InfoCard
                title="Fee Information"
                icon="💰"
                gradient="from-yellow-50 to-orange-50"
            >
                <InfoRow
                    label="Payment Status"
                    value={student.status}
                    icon="💳"
                />
                <InfoRow label="Total Fee" value="₹ --" icon="💵" />

                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs">
                            ℹ️
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-blue-800 mb-1">
                                Note
                            </p>
                            <p className="text-xs text-blue-700">
                                Fee details will be available after admission
                                confirmation.
                            </p>
                        </div>
                    </div>
                </div>
            </InfoCard>

            {/* Compact Fee Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl text-white text-center">
                    <span className="text-lg block mb-1">✅</span>
                    <p className="text-green-100 text-xs">Paid</p>
                    <p className="text-lg font-bold">₹ 0</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl text-white text-center">
                    <span className="text-lg block mb-1">⏳</span>
                    <p className="text-orange-100 text-xs">Pending</p>
                    <p className="text-lg font-bold">₹ --</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white text-center">
                    <span className="text-lg block mb-1">💯</span>
                    <p className="text-blue-100 text-xs">Total</p>
                    <p className="text-lg font-bold">₹ --</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-white text-center">
                    <span className="text-lg block mb-1">📅</span>
                    <p className="text-purple-100 text-xs">Due</p>
                    <p className="text-sm font-bold">TBD</p>
                </div>
            </div>
        </div>
    )
}

export default Fee