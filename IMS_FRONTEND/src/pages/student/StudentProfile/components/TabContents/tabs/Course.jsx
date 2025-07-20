import React from 'react'

const Course = ({student,InfoCard,InfoRow}) => {
    return (
        <>
            <InfoCard
                title="Course Information"
                icon="📚"
                gradient="from-orange-50 to-red-50"
            >
                <InfoRow
                    label="Course Applied"
                    value={student.courseApplied}
                    icon="📖"
                />
                <InfoRow
                    label="Preferred Learning Mode"
                    value={student.preferredModeOfLearning}
                    icon="💻"
                />
                <InfoRow
                    label="Referral Name"
                    value={student.referalName}
                    icon="👥"
                />
                <InfoRow
                    label="Referral Source"
                    value={student.referralSource}
                    icon="📢"
                />
            </InfoCard>
        </>
    )
}

export default Course