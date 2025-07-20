import React from 'react'

const Academic = ({student,InfoCard,InfoRow}) => {
    return (
        <>
            <div className="space-y-4">
                <InfoCard
                    title="Academic Background"
                    icon="🎓"
                    gradient="from-purple-50 to-pink-50"
                >
                    <InfoRow
                        label="Highest Qualification"
                        value={student.highestEducationalQualification}
                        icon="🏆"
                    />
                    <InfoRow
                        label="Board/University"
                        value={student.boardOrUniversity}
                        icon="🏫"
                    />
                    <InfoRow
                        label="Year of Passing"
                        value={student.yearOfPassing}
                        icon="📅"
                    />
                    <InfoRow
                        label="Subjects Studied"
                        value={student.subjectsStudied?.join(", ")}
                        icon="📚"
                    />
                </InfoCard>

                {/* Compact Academic Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs">Academic Year</p>
                                <p className="text-xl font-bold">
                                    {student.yearOfPassing || "N/A"}
                                </p>
                            </div>
                            <span className="text-xl">📊</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-xs">Subjects</p>
                                <p className="text-xl font-bold">
                                    {student.subjectsStudied?.length || "N/A"}
                                </p>
                            </div>
                            <span className="text-xl">📖</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-xs">Level</p>
                                <p className="text-sm font-bold">
                                    {student.highestEducationalQualification?.substring(
                                        0,
                                        15
                                    ) || "N/A"}
                                </p>
                            </div>
                            <span className="text-xl">🎯</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Academic