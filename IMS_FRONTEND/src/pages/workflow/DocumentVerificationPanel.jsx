import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/API";
import { useNotification } from "../../services/NotificationService";
import Pagination from "../../components/common/Pagination";

const DocumentVerificationPanel = () => {
  const notify = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchStudents(searchQuery);
  }, [currentPage, itemsPerPage]);

  const fetchStudents = async (query = "") => {
    setLoading(true);
    try {
      const response = await API.get("/students", {
        params: { search: query, limit: itemsPerPage, page: currentPage },
      });
      if (response.success || response.students) {
        setStudents(response.students || response.data || []);
        setTotalItems(response.totalCount || response.students?.length || 0);
      }
    } catch (error) {
      notify(error.response?.data?.message || "Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchStudents(searchQuery);
    } else {
      setCurrentPage(1); // Effect will trigger fetch
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="max-w-md w-full">
          <form onSubmit={handleSearch} className="relative flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, reg no, form no..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <button
              type="submit"
              className="ml-3 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-lg shadow-sm transition-all"
            >
              Search
            </button>
          </form>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button onClick={() => setViewMode("grid")} type="button" className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" /></svg>
          </button>
          <button onClick={() => setViewMode("table")} type="button" className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-slate-400 text-sm font-bold">
          Searching students...
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 h-48 bg-white rounded-xl border border-dashed border-slate-300 text-center">
          <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 className="text-sm font-bold text-slate-600">No Match</h3>
          <p className="text-slate-400 mt-1 text-xs">Try a different search query.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="bg-white border flex flex-col justify-between border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 font-bold text-sm text-indigo-600">
                  {getInitials(student.name)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Course: {student.course}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    Status: {student.studentStatus}
                  </p>
                </div>
              </div>

              <div className="mt-2 text-right">
                <Link
                  to={`/dashboard/workflow/document-verification/${student._id}`}
                  className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 outline-none border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm group-hover:bg-indigo-600 group-hover:text-white"
                >
                  Verify Documents
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 border-b border-slate-200">Student Name</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Course</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Status</th>
                <th className="text-right px-4 py-3 border-b border-slate-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 font-bold text-[10px] text-indigo-600">
                      {getInitials(student.name)}
                    </div>
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{student.course || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {student.studentStatus || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/dashboard/workflow/document-verification/${student._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Verify
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={startIndex + itemsPerPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageSizeChange={setItemsPerPage}
      />
    </div>
  );
};

export default DocumentVerificationPanel;
