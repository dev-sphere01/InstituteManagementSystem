import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/API";
import { useNotification } from "../../services/NotificationService";

const DocumentVerificationPanel = () => {
  const notify = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch to show some students or keep it empty
    fetchStudents("");
  }, []);

  const fetchStudents = async (query = "") => {
    setLoading(true);
    try {
      const response = await API.get("/students", {
        params: { search: query, limit: 20 },
      });
      if (response.success || response.students) {
        setStudents(response.students || response.data || []);
      }
    } catch (error) {
      notify(error.response?.data?.message || "Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-10 text-slate-400 text-sm font-bold">
            Searching students...
          </div>
        ) : students.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-14 h-48 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <svg
              className="w-10 h-10 text-slate-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              ></path>
            </svg>
            <h3 className="text-sm font-bold text-slate-600">No Match</h3>
            <p className="text-slate-400 mt-1 text-xs">
              Try a different search query.
            </p>
          </div>
        ) : (
          students.map((student) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentVerificationPanel;
