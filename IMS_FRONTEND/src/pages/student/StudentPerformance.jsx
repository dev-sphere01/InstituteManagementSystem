import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DUMMY_PERFORMANCE = {
  'STU001': { grade: 'A', attendance: 95, participation: 90, discipline: 98 },
  'STU002': { grade: 'B', attendance: 88, participation: 85, discipline: 92 },
  'STU003': { grade: 'A+', attendance: 98, participation: 95, discipline: 99 },
  'STU004': { grade: 'B+', attendance: 90, participation: 88, discipline: 95 },
  'STU005': { grade: 'A', attendance: 93, participation: 91, discipline: 97 },
};

const DUMMY_STUDENTS = [
  { studentId: 'STU001', name: 'Alice Johnson', course: 'B.Sc Computer Science' },
  { studentId: 'STU002', name: 'Bob Smith', course: 'B.A Economics' },
  { studentId: 'STU003', name: 'Charlie Lee', course: 'B.Com' },
  { studentId: 'STU004', name: 'Diana Patel', course: 'B.Sc Mathematics' },
  { studentId: 'STU005', name: 'Ethan Brown', course: 'BBA' },
];

const StudentPerformance = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = DUMMY_STUDENTS.find(s => s.studentId === studentId);
  const perf = DUMMY_PERFORMANCE[studentId];

  const [editMode, setEditMode] = React.useState(!perf);
  const [form, setForm] = React.useState(perf || {
    grade: '',
    attendance: '',
    participation: '',
    discipline: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert('Saved! (Demo only)');
    setEditMode(false);
  };

  if (!student) return <div className="p-6 text-gray-800 dark:text-gray-100">Student not found.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto text-gray-800 dark:text-gray-100">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        &larr; Back
      </button>

      <h2 className="text-xl font-bold mb-4">Performance for {student.name}</h2>

      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div><b>Registration No:</b> {student.studentId}</div>
        <div><b>Name:</b> {student.name}</div>
        <div><b>Course:</b> {student.course}</div>
      </div>

      {editMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded p-4">
            <div className="font-semibold mb-1">Grade</div>
            <input
              name="grade"
              value={form.grade}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Grade"
            />
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded p-4">
            <div className="font-semibold mb-1">Attendance (%)</div>
            <input
              type="number"
              min="0"
              max="100"
              name="attendance"
              value={form.attendance}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Attendance"
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900 rounded p-4">
            <div className="font-semibold mb-1">Participation (%)</div>
            <input
              type="number"
              min="0"
              max="100"
              name="participation"
              value={form.participation}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Participation"
            />
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 rounded p-4">
            <div className="font-semibold mb-1">Discipline (%)</div>
            <input
              type="number"
              min="0"
              max="100"
              name="discipline"
              value={form.discipline}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Discipline"
            />
          </div>
        </div>
      ) : perf ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded p-4">
            <div className="font-semibold mb-1">Grade</div>
            <div className="text-2xl">{perf.grade}</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded p-4">
            <div className="font-semibold mb-1">Attendance</div>
            <div className="text-2xl">{perf.attendance}%</div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900 rounded p-4">
            <div className="font-semibold mb-1">Participation</div>
            <div className="text-2xl">{perf.participation}%</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 rounded p-4">
            <div className="font-semibold mb-1">Discipline</div>
            <div className="text-2xl">{perf.discipline}%</div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">No performance data found.</div>
      )}

      <div className="mt-6 flex gap-2">
        {editMode ? (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition"
          >
            {perf ? 'Update' : 'Add'} Performance
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentPerformance;
