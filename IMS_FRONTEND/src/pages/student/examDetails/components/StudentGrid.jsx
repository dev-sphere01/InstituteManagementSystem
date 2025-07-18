import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TableService from "./TableService";
import { DUMMY_STUDENTS } from "../data/dummyStudents";

const StudentGrid = () => {
  const navigate = useNavigate();

  const columns = useMemo(() => [
    {
      header: "Photo",
      accessorKey: "photo",
      enableSorting: false,
      cell: ({ row }) => {
        const student = row.original;
        return student.photo ? (
          <img
            src={student.photo}
            alt={student.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 grid place-items-center text-sm font-semibold">
            {student.name[0]}
          </div>
        );
      },
    },
    {
      header: "Reg No",
      accessorKey: "studentId",
      filterFn: "includesString",
    },
    {
      header: "Name",
      accessorKey: "name",
      filterFn: "includesString",
      cell: ({ row, getValue }) => (
        <button
          onClick={() => navigate(`/exam/${row.original.studentId}`)}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {getValue()}
        </button>
      ),
    },
    {
      header: "Course",
      accessorKey: "course",
      filterFn: "includesString",
    },
    {
      header: "Total Fee (₹)",
      accessorKey: "totalFee",
      cell: ({ getValue }) =>
        getValue().toLocaleString(undefined, { maximumFractionDigits: 0 }),
    },
    {
      header: "Deposited (₹)",
      accessorKey: "depositedFee",
      cell: ({ getValue }) =>
        getValue().toLocaleString(undefined, { maximumFractionDigits: 0 }),
    },
  ], [navigate]);

  const data = useMemo(() => DUMMY_STUDENTS, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Student Grid</h2>
      <TableService
        columns={columns}
        data={data}
        initialPageSize={10}
      />
    </div>
  );
};

export default StudentGrid;
