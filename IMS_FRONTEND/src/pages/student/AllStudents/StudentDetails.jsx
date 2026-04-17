import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableService from "../../../services/TableService";
import studentService from "../../../services/studentService";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        search: globalFilter,
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
      };
      const response = await studentService.list(params);
      const payload = response?.data || response;
      const data = payload?.students || [];
      const totalCount = payload?.totalCount || data.length;

      setStudents(data);
      setTotal(totalCount || data.length);
    } catch (error) {
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const exportToExcel = async () => {
    setLoading(true);
    try {
      // Fetch all students without pagination for the report
      const response = await studentService.list({ limit: 1000, search: globalFilter });
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
      const response = await studentService.list({ limit: 1000, search: globalFilter });
      const data = response?.data?.students || response?.students || [];
      
      const doc = new jsPDF("l", "pt", "a4");
      doc.text("Student Workflow Report", 40, 40);
      
      const tableColumn = ["Name", "Form No", "Course", "Fee %", "Current Task", "Status"];
      const tableRows = data.map(s => [
        s.name,
        s.formNo,
        s.course,
        s.feePercentage + "%",
        s.currentTask,
        s.currentTaskStatus
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
      });
      doc.save(`Student_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("Export failed", error);
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
            <span className={`text-[9px] font-black uppercase tracking-widest px-1 rounded w-fit ${
               row.original.currentTaskStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
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
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
            row.original.studentStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {row.original.studentStatus || 'N/A'}
          </span>
        ),
      },
    ],
    [navigate]
  );

  const completedCount = students.filter((s) => s.currentTaskStatus === "completed").length;
  const overdueCount = students.filter((s) => s.currentTaskStatus === "overdue").length;
  const escalatedCount = students.filter((s) => s.currentTaskStatus === "escalated").length;

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Student Workflow</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and track student progress across lifecycle stages.</p>
        </div>
        
        <div className="flex items-center gap-2">
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
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Completed</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{completedCount}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Overdue</h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{overdueCount}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Escalated</h3>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">{escalatedCount}</p>
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
    </div>
  );
};

export default StudentDetails;
