import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableService from "../../../services/TableService";
import studentService from "../../../services/studentService";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import EditFeeModal from "../StudentProfile/components/EditFeeModal";

const statusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "overdue":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "escalated":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const StudentDetails = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [serverPagination] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [metrics, setMetrics] = useState({ total: 0, completed: 0, overdue: 0, escalated: 0 });

  // Edit Fee Modal state
  const [selectedFeeStudentId, setSelectedFeeStudentId] = useState(null);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        search: globalFilter,
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
      };
      if (taskStatusFilter) {
        params.taskStatus = taskStatusFilter;
      }
      if (lifecycleFilter) {
        params.status = lifecycleFilter;
      }
      const response = await studentService.list(params);
      const payload = response?.data || response;
      const data = payload?.students || [];
      const totalCount = payload?.totalCount || data.length;

      setStudents(data);
      setTotal(totalCount || data.length);
      if (payload?.metrics) {
        setMetrics(payload.metrics);
      }
    } catch (error) {
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, taskStatusFilter, lifecycleFilter]);

  const handleTaskStatusFilterChange = (status) => {
    setTaskStatusFilter(status);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      // Fetch all students without pagination for the report
      const params = { limit: 1000, search: globalFilter };
      if (taskStatusFilter) params.taskStatus = taskStatusFilter;
      const response = await studentService.list(params);
      const data = response?.data?.students || response?.students || [];

      const worksheet = XLSX.utils.json_to_sheet(data.map(s => ({
        "Name": s.name,
        "Form No": s.formNo,
        "Email": s.email,
        "Contact": s.contact,
        "Course": s.course,
        "Fee Paid %": s.feePercentage + "%",
        "Current Task": s.currentTask,
        "Task Status": s.currentTaskStatus,
        "Student Status": s.studentStatus
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, `Student_Report_${new Date().toLocaleDateString()}.xlsx`);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    setLoading(true);
    try {
      const params = { limit: 1000, search: globalFilter };
      if (taskStatusFilter) params.taskStatus = taskStatusFilter;
      const response = await studentService.list(params);
      const data = response?.data?.students || response?.students || [];

      if (data.length === 0) {
        alert("No data to export.");
        return;
      }

      const doc = new jsPDF("l", "pt", "a4");

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("DevSphere | IMS — Student Workflow Report", 40, 36);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}  |  Filter: ${taskStatusFilter || "All"}  |  Total: ${data.length}`, 40, 52);
      doc.setTextColor(0);

      const tableColumn = ["Name", "Form No", "Course", "Fee %", "Current Task", "Task Status", "Student Status"];
      const tableRows = data.map((s) => [
        s.name || "—",
        s.formNo || "—",
        s.course || "—",
        (s.feePercentage ?? 0) + "%",
        s.currentTask || "—",
        s.currentTaskStatus || "—",
        s.studentStatus || "—",
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 64,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        margin: { left: 40, right: 40 },
      });

      doc.save(`Student_Report_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <button
              className="text-blue-600 hover:underline cursor-pointer px-0 py-0 text-left bg-transparent font-bold"
              onClick={() => navigate(`/dashboard/student-details/${row.original._id}`)}
            >
              {row.original.name}
            </button>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">#{row.original.formNo || 'N/A'}</span>
          </div>
        ),
      },
      {
        header: "Course",
        accessorKey: "course",
      },
      {
        header: "Fee %",
        accessorKey: "feePercentage",
        cell: ({ row }) => {
          const percent = Number(row.original.feePercentage || 0);
          return (
            <div className="min-w-[120px]">
              <div className="text-xs font-medium mb-1">{percent}%</div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        header: "Lifecycle Stage",
        accessorKey: "currentTask",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">{row.original.currentTask}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-1 rounded w-fit ${row.original.currentTaskStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
              row.original.currentTaskStatus === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-500'
              }`}>
              {row.original.currentTaskStatus}
            </span>
          </div>
        )
      },
      {
        header: "Status",
        accessorKey: "studentStatus",
        cell: ({ row }) => {
          const st = row.original.studentStatus || 'Pending';
          const colorClass =
            st === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
            st === 'Completed' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
            st === 'Dropped' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
            st === 'Incomplete' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
            st === 'OnHold' || st === 'On Hold' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
          return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colorClass}`}>
              {st}
            </span>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedFeeStudentId(row.original._id);
              setIsFeeModalOpen(true);
            }}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all cursor-pointer"
          >
            Edit Fees
          </button>
        ),
      },
    ],
    [navigate]
  );

  // Metrics loaded dynamically from server
  const completedCount = metrics.completed;
  const overdueCount = metrics.overdue;
  const escalatedCount = metrics.escalated;

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Student Workflow</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and track student progress across lifecycle stages.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Lifecycle Status Filter Dropdown */}
          <select
            value={lifecycleFilter}
            onChange={(e) => {
              setLifecycleFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
            <option value="Incomplete">Incomplete</option>
            <option value="OnHold">On Hold</option>
            <option value="Admitted">Admitted</option>
            <option value="Prospect">Prospect</option>
          </select>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Excel Report
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            PDF Report
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => handleTaskStatusFilterChange("")}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.98] duration-200 ${taskStatusFilter === ""
            ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 shadow-sm shadow-blue-400/20"
            : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-950 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-900"
            }`}
        >
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total Students</h3>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{metrics.total}</p>
        </div>
        <div
          onClick={() => handleTaskStatusFilterChange("completed")}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.98] duration-200 ${taskStatusFilter === "completed"
            ? "bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-500 shadow-sm shadow-green-400/20"
            : "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-950 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-900"
            }`}
        >
          <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">Completed</h3>
          <p className="text-2xl font-black text-green-900 dark:text-green-100">{completedCount}</p>
        </div>
        <div
          onClick={() => handleTaskStatusFilterChange("overdue")}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.98] duration-200 ${taskStatusFilter === "overdue"
            ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-500 shadow-sm shadow-yellow-400/20"
            : "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-950 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-200 dark:hover:border-yellow-900"
            }`}
        >
          <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Overdue</h3>
          <p className="text-2xl font-black text-yellow-900 dark:text-yellow-100">{overdueCount}</p>
        </div>
        <div
          onClick={() => handleTaskStatusFilterChange("escalated")}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.98] duration-200 ${taskStatusFilter === "escalated"
            ? "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-500 shadow-sm shadow-red-400/20"
            : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-900"
            }`}
        >
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Escalated</h3>
          <p className="text-2xl font-black text-red-900 dark:text-red-100">{escalatedCount}</p>
        </div>
      </div>
      <TableService
        columns={columns}
        data={students}
        loading={loading}
        serverPagination={serverPagination}
        pageCount={Math.ceil(total / pagination.pageSize)}
        initialPageSize={pagination.pageSize}
        onPaginationChange={({ pageIndex, pageSize }) => {
          setPagination({ pageIndex, pageSize });
        }}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />

      {isFeeModalOpen && selectedFeeStudentId && (
        <EditFeeModal
          isOpen={isFeeModalOpen}
          onClose={() => {
            setIsFeeModalOpen(false);
            setSelectedFeeStudentId(null);
          }}
          studentId={selectedFeeStudentId}
          onFeeUpdated={fetchStudents}
        />
      )}
    </div>
  );
};

export default StudentDetails;
