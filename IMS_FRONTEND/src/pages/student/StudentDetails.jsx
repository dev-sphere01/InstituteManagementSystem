import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/API';

const DUMMY_STUDENTS = [
  {
    _id: '1',
    studentId: 'STU001',
    name: 'Alice Johnson',
    course: 'B.Sc Computer Science',
    totalFee: 50000
  },
  {
    _id: '2',
    studentId: 'STU002',
    name: 'Bob Smith',
    course: 'B.A Economics',
    totalFee: 42000
  },
  {
    _id: '3',
    studentId: 'STU003',
    name: 'Charlie Lee',
    course: 'B.Com',
    totalFee: 47000
  },
  {
    _id: '4',
    studentId: 'STU004',
    name: 'Diana Patel',
    course: 'B.Sc Mathematics',
    totalFee: 51000
  },
  {
    _id: '5',
    studentId: 'STU005',
    name: 'Ethan Brown',
    course: 'BBA',
    totalFee: 48000
  }
];

const StudentDetails = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(DUMMY_STUDENTS);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // For demo, filter and sort dummy data only
    let filtered = DUMMY_STUDENTS.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
    );
    filtered = filtered.sort((a, b) => {
      if (sortOrder === 'asc') return (a[sortKey] > b[sortKey] ? 1 : -1);
      return a[sortKey] < b[sortKey] ? 1 : -1;
    });
    setTotal(filtered.length);
    setStudents(filtered.slice((page - 1) * pageSize, page * pageSize));
    // eslint-disable-next-line
  }, [search, sortKey, sortOrder, page, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleAction = (action, student) => {
    if (action === 'Exam Details') {
      navigate(`/dashboard/exam-details/${student.studentId}`);
    } else if (action === 'Student Performance') {
      navigate(`/dashboard/student-performance/${student.studentId}`);
    }
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors">
      <h1 className="text-2xl font-bold mb-4">Student Details</h1>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('studentId')}>Student ID{sortKey === 'studentId' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('name')}>Name{sortKey === 'name' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('course')}>Selected Course{sortKey === 'course' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('totalFee')}>Total Fee{sortKey === 'totalFee' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">Loading...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">No students found.</td>
              </tr>
            ) : students.map(student => (
              <tr key={student._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2 text-center">{student.studentId}</td>
                <td className="p-2 text-center">{student.name}</td>
                <td className="p-2 text-center">{student.course}</td>
                <td className="p-2 text-center">₹{student.totalFee.toLocaleString()}</td>
                <td className="p-2 space-x-2 text-center">
                  <button onClick={() => handleAction('Exam Details', student)} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition">Exam Details</button>
                  <button onClick={() => handleAction('Student Performance', student)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition">Student Performance</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
        <div>
          Page {page} of {Math.ceil(total / pageSize) || 1}
        </div>

        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded px-2 py-1"
        >
          {[10, 20, 50].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StudentDetails;
