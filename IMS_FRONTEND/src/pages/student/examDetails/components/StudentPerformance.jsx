import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DUMMY_STUDENTS } from "./dummyStudents";

const StudentPerformance = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = DUMMY_STUDENTS.find((s) => s.studentId === studentId);

  // Dummy performance data (can later come from API)
  const performance = {
    grade: "A",
    attendance: 92,
    participation: 88,
    discipline: 95,
  };

  if (!student) {
    return (
      <div className="p-6 text-gray-700 dark:text-gray-200">
        Student not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-800 dark:text-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
      >
        &larr; Back
      </button>

      <h2 className="text-xl font-bold mb-4">
        Performance Report: {student.name}
      </h2>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded shadow p-4 space-y-4">
        <div>
          <b>Registration No:</b> {student.studentId}
        </div>
        <div>
          <b>Course:</b> {student.course}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded bg-blue-100 dark:bg-blue-900/30">
            <div className="text-sm text-gray-600 dark:text-gray-400">Grade</div>
            <div className="text-xl font-bold">{performance.grade}</div>
          </div>

          <div className="p-4 rounded bg-green-100 dark:bg-green-900/30">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Attendance (%)
            </div>
            <div className="text-xl font-bold">{performance.attendance}%</div>
          </div>

          <div className="p-4 rounded bg-purple-100 dark:bg-purple-900/30">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Participation (%)
            </div>
            <div className="text-xl font-bold">{performance.participation}%</div>
          </div>

          <div className="p-4 rounded bg-yellow-100 dark:bg-yellow-900/30">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Discipline (%)
            </div>
            <div className="text-xl font-bold">{performance.discipline}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
