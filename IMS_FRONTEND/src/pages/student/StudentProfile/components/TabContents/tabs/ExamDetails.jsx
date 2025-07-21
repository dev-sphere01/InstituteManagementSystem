import React from 'react'

const ExamDetails = ({ student, InfoRow, InfoCard, API, isDarkMode, id }) => {

    const studentId = id;

    return (
        <div>
            <div className="text-blue-700">Student's Id - {studentId}</div>
        </div>
    )
}

export default ExamDetails