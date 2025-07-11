import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/API';

const StudentDetails = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch real student data from admission API
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admissions');
      const admissions = response;
      console.log('admissions:', admissions);
      
      // Transform admission data to student format for the table
      const transformedStudents = admissions.map(admission => ({
        _id: admission._id,
        studentId: admission.generatedRegNo || admission.formNo,
        name: admission.fullName,
        course: admission.courseApplied,
        totalFee: calculateFee(admission), // Calculate fee based on course and extras
        contactNumber: admission.contactNumber,
        emailAddress: admission.emailAddress,
        status: admission.status,
        dob: admission.dob,
        category: admission.category,
        preferredModeOfLearning: admission.preferredModeOfLearning
      }));
      
      console.log('transformedStudents:', transformedStudents);
      setAllStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to empty array if API fails
      setAllStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate fee based on course and selected extras
  const calculateFee = (admission) => {
    let baseFee = 45000; // Default base fee
    
    // Adjust base fee based on course
    const course = typeof admission.courseApplied === 'string' ? admission.courseApplied.toLowerCase() : '';
    if (course.includes('computer science') || course.includes('bca') || course.includes('mca')) {
      baseFee = 55000;
    } else if (course.includes('engineering') || course.includes('b.tech')) {
      baseFee = 65000;
    } else if (course.includes('mba') || course.includes('management')) {
      baseFee = 60000;
    } else if (course.includes('commerce') || course.includes('b.com')) {
      baseFee = 40000;
    }

    // Add extra fees for additional courses
    let extraFee = 0;
    if (admission.tShirt) extraFee += 500;
    if (admission.itTools) extraFee += 5000;
    if (admission.webDesigning) extraFee += 8000;
    if (admission.tally) extraFee += 3000;
    if (admission.gfxDtp) extraFee += 6000;
    if (admission.python) extraFee += 10000;
    if (admission.iot) extraFee += 12000;

    return baseFee + extraFee;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter and sort students based on search and sort criteria
    let filtered = allStudents.filter(s =>
      (typeof s.name === 'string' && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (typeof s.studentId === 'string' && s.studentId.toLowerCase().includes(search.toLowerCase())) ||
      (typeof s.course === 'string' && s.course.toLowerCase().includes(search.toLowerCase())) ||
      (s.contactNumber && s.contactNumber.includes(search)) ||
      (typeof s.emailAddress === 'string' && s.emailAddress.toLowerCase().includes(search.toLowerCase()))
    );
    
    filtered = filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      
      // Handle different data types
      if (sortKey === 'totalFee') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = typeof aVal === 'string' ? aVal.toLowerCase() : String(aVal);
        bVal = typeof bVal === 'string' ? bVal.toLowerCase() : String(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    setTotal(filtered.length);
    setStudents(filtered.slice((page - 1) * pageSize, page * pageSize));
  }, [allStudents, search, sortKey, sortOrder, page, pageSize]);

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
    } else if (action === 'View Details') {
      navigate(`/dashboard/student-profile/${student._id}`);
    }
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors">
      <h1 className="text-2xl font-bold mb-4">Student Details</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{allStudents.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Submitted</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {allStudents.filter(s => s.status === 'Submitted').length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {allStudents.filter(s => s.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Revenue</h3>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            ₹{allStudents.reduce((sum, s) => sum + s.totalFee, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          type="text"
          placeholder="Search by name, ID, course, contact, or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('studentId')}>Student ID{sortKey === 'studentId' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('name')}>Name{sortKey === 'name' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('course')}>Course Applied{sortKey === 'course' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('status')}>Status{sortKey === 'status' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 cursor-pointer select-none text-center" onClick={() => handleSort('totalFee')}>Total Fee{sortKey === 'totalFee' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Loading...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">No students found.</td>
              </tr>
            ) : students.map(student => (
              <tr key={student._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2 text-center">{student.studentId}</td>
                <td className="p-2 text-center">{student.name}</td>
                <td className="p-2 text-center">{student.course}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    student.status === 'Submitted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    student.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-2 text-center">₹{student.totalFee.toLocaleString()}</td>
                <td className="p-2 space-x-1 text-center">
                  <button onClick={() => handleAction('View Details', student)} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-xs">View Details</button>
                  <button onClick={() => handleAction('Exam Details', student)} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs">Exam Details</button>
                  <button onClick={() => handleAction('Student Performance', student)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition text-xs">Performance</button>
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
