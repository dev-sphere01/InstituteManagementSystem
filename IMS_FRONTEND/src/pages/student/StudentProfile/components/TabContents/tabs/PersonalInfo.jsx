import React from 'react'

const PersonalInfo = ({student,InfoCard,InfoRow}) => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InfoCard
                    title="Basic Information"
                    icon="👤"
                    gradient="from-blue-50 to-indigo-50"
                >
                    <InfoRow
                        label="Full Name"
                        value={student.fullName}
                        icon="👨"
                    />
                    <InfoRow
                        label="Email Address"
                        value={student.emailAddress}
                        icon="📧"
                    />
                    <InfoRow label="Gender" value={student.gender} icon="⚤" />
                    <InfoRow
                        label="Category"
                        value={student.category}
                        icon="📝"
                    />
                    <InfoRow
                        label="Contact Number"
                        value={student.contactNumber}
                        icon="📱"
                    />
                </InfoCard>

                <InfoCard
                    title="Address & Family"
                    icon="🏠"
                    gradient="from-emerald-50 to-teal-50"
                >
                    <InfoRow
                        label="Address"
                        value={student.address}
                        icon="🗺️"
                    />
                    <InfoRow
                        label="Father's Name"
                        value={student.fathersName}
                        icon="👨‍💼"
                    />
                    <InfoRow
                        label="Father's Occupation"
                        value={student.fathersOccupation}
                        icon="💼"
                    />
                    <InfoRow
                        label="Mother's Name"
                        value={student.mothersName}
                        icon="👩"
                    />
                </InfoCard>
            </div>
        </>
    )
}

export default PersonalInfo