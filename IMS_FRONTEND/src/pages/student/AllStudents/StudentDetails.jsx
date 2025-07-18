import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/API";
import TableService from "../../../services/TableService";

const StudentDetails = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [serverPagination] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch student data with pagination and search
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: globalFilter,
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
      };
      const response = await API.get("/admissions", { params });
      const admissions = response.admissions || [];
      const totalCount = response.totalCount || admissions.length;

      const transformedStudents = admissions.map((admission) => ({
        _id: admission._id,
        studentId: admission.generatedRegNo || admission.formNo,
        name: admission.fullName,
        course: admission.courseApplied,
        totalFee: calculateFee(admission),
        contactNumber: admission.contactNumber,
        emailAddress: admission.emailAddress,
        status: admission.status,
        dob: admission.dob,
        category: admission.category,
        preferredModeOfLearning: admission.preferredModeOfLearning,
      }));

      setStudents(transformedStudents);
      setTotal(totalCount);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate fee based on course and selected extras
  const calculateFee = (admission) => {
    let baseFee = 45000; // Default base fee

    // Adjust base fee based on course
    const course =
      typeof admission.courseApplied === "string"
        ? admission.courseApplied.toLowerCase()
        : "";
    if (
      course.includes("computer science") ||
      course.includes("bca") ||
      course.includes("mca")
    ) {
      baseFee = 55000;
    } else if (course.includes("engineering") || course.includes("b.tech")) {
      baseFee = 65000;
    } else if (course.includes("mba") || course.includes("management")) {
      baseFee = 60000;
    } else if (course.includes("commerce") || course.includes("b.com")) {
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
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  // Removed handleAction, navigation is now handled in cell renderers
  const columns = useMemo(
    () => [
      {
        header: "Student ID",
        accessorKey: "studentId",
        cell: ({ row }) => (
          <button
            className="text-blue-600 hover:underline cursor-pointer px-2 py-1 bg-transparent"
            onClick={() =>
              navigate(`/dashboard/student-details/${row.original._id}`)
            }
          >
            {row.original.studentId}
          </button>
        ),
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <button
            className="text-blue-600 hover:underline cursor-pointer px-2 py-1 bg-transparent"
            onClick={() =>
              navigate(`/dashboard/student-details/${row.original._id}`)
            }
          >
            {row.original.name}
          </button>
        ),
      },
      {
        header: "Contact Number",
        accessorKey: "contactNumber",
      },
      {
        header: "Course Applied",
        accessorKey: "course",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              row.original.status === "Submitted"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : row.original.status === "Pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        header: "Total Fee",
        accessorKey: "totalFee",
        cell: ({ row }) => `₹${row.original.totalFee.toLocaleString()}`,
      },
    ],
    [navigate]
  );
  return (
    <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors">
      <h1 className="text-2xl font-bold mb-4">Student Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Total Students
          </h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {total}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
            Submitted
          </h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {students.filter((s) => s.status === "Submitted").length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Pending
          </h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {students.filter((s) => s.status === "Pending").length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            ₹{students.reduce((sum, s) => sum + s.totalFee, 0).toLocaleString()}
          </p>
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
