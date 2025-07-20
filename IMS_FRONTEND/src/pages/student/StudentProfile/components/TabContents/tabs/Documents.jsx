import React from 'react'

const Documents = ({ student, InfoCard, InfoRow }) => {
    return (
        <div className="space-y-4">
            <InfoCard
                title="Uploaded Documents"
                icon="📄"
                gradient="from-slate-50 to-gray-50"
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        {
                            label: "Photo",
                            key: "candidatePhoto",
                            icon: "📸",
                            color: "from-blue-500 to-indigo-600",
                        },
                        {
                            label: "Signature",
                            key: "candidateSignature",
                            icon: "✍️",
                            color: "from-purple-500 to-pink-600",
                        },
                        {
                            label: "Aadhar Card",
                            key: "aadharPhoto",
                            icon: "🆔",
                            color: "from-emerald-500 to-teal-600",
                        },
                        {
                            label: "10th Marksheet",
                            key: "tenthMarksheet",
                            icon: "📋",
                            color: "from-orange-500 to-red-600",
                        },
                        {
                            label: "12th Marksheet",
                            key: "twelfthMarksheet",
                            icon: "📋",
                            color: "from-yellow-500 to-orange-600",
                        },
                        {
                            label: "Income Certificate",
                            key: "incomeCertificate",
                            icon: "📄",
                            color: "from-slate-500 to-gray-600",
                        },
                    ].map(({ label, key, icon, color }) => (
                        <div
                            key={key}
                            className={`relative p-3 rounded-xl border transition-all duration-200 ${student[key]
                                ? "border-green-200 bg-green-50 hover:bg-green-100"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                                }`}
                        >
                            <div
                                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${student[key] ? "bg-green-500" : "bg-slate-300"
                                    }`}
                            ></div>

                            <div className="flex flex-col items-center text-center space-y-2">
                                <div
                                    className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white text-lg`}
                                >
                                    {icon}
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                                        {label}
                                    </h4>
                                    <p
                                        className={`text-xs ${student[key]
                                            ? "text-green-600"
                                            : "text-slate-500"
                                            }`}
                                    >
                                        {student[key] ? "✅ Available" : "❌ Missing"}
                                    </p>
                                </div>

                                {student[key] ? (
                                    <a
                                        href={`http://localhost:4000/${student[key]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                                    >
                                        View
                                        <svg
                                            className="w-3 h-3 ml-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    </a>
                                ) : (
                                    <div className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg cursor-not-allowed">
                                        N/A
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </InfoCard>

            {/* Compact Document Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs">Uploaded</p>
                            <p className="text-2xl font-bold">
                                {
                                    [
                                        student.candidatePhoto,
                                        student.candidateSignature,
                                        student.aadharPhoto,
                                        student.tenthMarksheet,
                                        student.twelfthMarksheet,
                                        student.incomeCertificate,
                                    ].filter(Boolean).length
                                }
                                <span className="text-base"> / 6</span>
                            </p>
                        </div>
                        <span className="text-2xl">📊</span>
                    </div>
                    <div className="mt-2 bg-white/20 rounded-full h-1.5">
                        <div
                            className="bg-white rounded-full h-1.5 transition-all duration-500"
                            style={{
                                width: `${([
                                    student.candidatePhoto,
                                    student.candidateSignature,
                                    student.aadharPhoto,
                                    student.tenthMarksheet,
                                    student.twelfthMarksheet,
                                    student.incomeCertificate,
                                ].filter(Boolean).length /
                                    6) *
                                    100
                                    }%`,
                            }}
                        ></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-xs">Status</p>
                            <p className="text-xl font-bold">
                                {[
                                    student.candidatePhoto,
                                    student.candidateSignature,
                                    student.aadharPhoto,
                                    student.tenthMarksheet,
                                    student.twelfthMarksheet,
                                    student.incomeCertificate,
                                ].filter(Boolean).length === 6
                                    ? "Complete"
                                    : "Pending"}
                            </p>
                        </div>
                        <span className="text-2xl">
                            {[
                                student.candidatePhoto,
                                student.candidateSignature,
                                student.aadharPhoto,
                                student.tenthMarksheet,
                                student.twelfthMarksheet,
                                student.incomeCertificate,
                            ].filter(Boolean).length === 6
                                ? "✅"
                                : "⏳"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Documents