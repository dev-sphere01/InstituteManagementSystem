import getLoan from "@/services/LoansAdvances/GetLoans";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaEdit, FaMoneyBillWave, FaCogs } from "react-icons/fa";
import { Link } from "react-router-dom";
import { API, notification, TableService } from "@/services";
import useAuthStore from "@/store/authStore";
import { Description } from "@headlessui/react";

const LoanAdminDashboard = () => {
  const tableRef = useRef();
  const [repaymentConfig, setRepaymentConfig] = useState({
    emi: "",
    startDate: "",
    installments: "",
    interest: "",
  });
  const [loans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    // Initial load; subsequent changes are driven by TableService onRefresh
    getEmployeeRequest();
  }, []);

  const getEmployeeRequest = React.useCallback(async () => {
    setLoading(true);

    try {
      // Pull table state from TableService via ref if available (sorting/filters)
      let sorting = [];
      let columnFilters = [];
      let globalFilterVal = "";
      let pageIndex = 0;
      let pageSize = pagination.pageSize;

      if (tableRef.current?.getTableState) {
        const s = tableRef.current.getTableState();
        sorting = s?.sorting || [];
        columnFilters = s?.columnFilters || [];
        globalFilterVal = s?.globalFilter || "";
        pageIndex = s?.pagination?.pageIndex ?? 0;
        pageSize = s?.pagination?.pageSize ?? pagination.pageSize;
      }

      const apiResult = await getLoan.getAllLoan(
        globalFilterVal,
        pageIndex + 1,
        pageSize,
        null,
        null,
        columnFilters,
        sorting
      );

      // Expected: { Data, TotalCount, PageNumber, PageSize, TotalPages }
      if (apiResult && Array.isArray(apiResult.Data)) {
        const loans = apiResult.Data.map((ss) => {
          const raw = ss.IsApproved;
          // Normalize IsApproved from various possible backend shapes (bool/number/string/null)
          let normalized = null; // pending by default
          if (raw === true || raw === 1 || raw === "true" || raw === "True") normalized = true;
          else if (raw === false || raw === 0 || raw === "false" || raw === "False") normalized = false;
          else normalized = null; // pending/undefined

          const statusText = normalized === true ? "Approved" : normalized === false ? "Not Approved" : "Pending";

          // Normalize pause and force-close flags from various backend shapes
          const pausedRaw = ss.isPaused ?? ss.IsPaused ?? ss.IsPause ?? ss.Pause;
          const isPaused = (pausedRaw === true || pausedRaw === 1 || pausedRaw === "true" || pausedRaw === "True") ? true : false;

          const forceRaw = ss.isForceClosed ?? ss.IsForceClose ?? ss.IsForceClosed ?? ss.ForceClose ?? ss.IsForceCloseLoan;
          const isForceClosed = (forceRaw === true || forceRaw === 1 || forceRaw === "true" || forceRaw === "True") ? true : false;

          return {
            LnAID: ss.LnAID,
            EmpID: ss.EmpID,
            Description: ss.Description,
            Employee: ss.EmployeeName,
            Amount: ss.LoanAmount,
            Outstanding: ss.ClosingBalance,
            Period: ss.Period,
            MonthlyInstallment: ss.MonthlyInstallment,
            StartDate: ss.StartDate,
            IsApproved: normalized,
            Status: statusText,
            IsPaused: isPaused,
            IsForceClosed: isForceClosed,
          };
        });

        setAllLoans(loans);
        setTotalItems(apiResult.TotalCount || loans.length);
        setTotalPages(apiResult.TotalPages || 1);
        setCurrentPage(apiResult.PageNumber || (pageIndex + 1));
      } else {
        setAllLoans([]);
        setTotalItems(0);
        setTotalPages(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      setAllLoans([]);
      setTotalItems(0);
      setTotalPages(0);
      setCurrentPage(1);
    }
    setLoading(false);
  }, []);
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Handle global filter changes with debouncing
  const handleGlobalFilterChange = (value) => {
    setGlobalFilter(value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: "Employee",
        header: "Employee",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedEmployee(row.original);
              setRepaymentConfig({
                emi: row.original.MonthlyInstallment || "",
                startDate: row.original.StartDate || "",
              });
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
          >
            {row.original.Employee}
          </button>
        ),
        size: 180,
      },
      {
        accessorKey: "Amount",
        header: "Amount",
        enableSorting: true,
        enableColumnFilter: true,

        size: 200,
      },
      {
        accessorKey: "Outstanding",
        header: "Outstanding",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "Period",
        header: "Period",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "MonthlyInstallment",
        header: "MonthlyInstallment",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "StartDate",
        header: "StartDate",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "Status",
        header: "Status",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          const {
            LnAID,
            EmpID,
            Amount,
            Period,
            InterestRate,
            MonthlyInstallment,
            StartDate,
            Description,
          } = row.original;

          // Derive tri-state approval from row data
          const rawApproved = row.original.IsApproved;
          const isApproved =
            rawApproved === true || rawApproved === 1 || rawApproved === "true" || rawApproved === "True"
              ? true
              : rawApproved === false || rawApproved === 0 || rawApproved === "false" || rawApproved === "False"
              ? false
              : null;

          const [loadingApprove, setLoadingApprove] = React.useState(false);
          const [loadingReject, setLoadingReject] = React.useState(false);

          const updateApproval = async (approve) => {
            approve ? setLoadingApprove(true) : setLoadingReject(true);
            try {
              const approverEmpId = user?.empId || user?.EmpID || 0;
              if (approve) {
                await API.put(`LnAs/ApproveLoan/${LnAID}/${approverEmpId}`);
                notification().success(`Loan approved successfully!`);
              } else {
                await API.put(`/LnAs/RejectLoan?lnaId=${LnAID}&empId=${user?.empId}`);
                notification().success(`Loan rejected successfully!`);
              }
              // Always refresh table to reflect latest state
              getEmployeeRequest && getEmployeeRequest();
            } catch (err) {
              console.error(`Failed to ${approve ? "approve" : "reject"} loan:`, err);
              notification().error(`Error while ${approve ? "approving" : "rejecting"} loan.`);
            } finally {
              approve ? setLoadingApprove(false) : setLoadingReject(false);
            }
          };

          return (
            <div className="flex items-center gap-3">
              <div
                className={`text-sm font-medium ${isApproved === true ? "text-green-700" : isApproved === false ? "text-gray-600" : "text-yellow-700"}
                  }`}
              >
                {isApproved === true ? "Approved" : isApproved === false ? "Not Approved" : "Pending"}
              </div>
              {isApproved !== true && <>
                <button
                  onClick={() => updateApproval(true)}
                  disabled={isApproved === true || loadingApprove}
                  className={`px-2 py-1 rounded text-white text-xs ${isApproved === true
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                  title="Approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateApproval(false)}
                  disabled={loadingReject}
                  className={`px-2 py-1 rounded text-white text-xs ${"bg-red-600 hover:bg-red-700"}`}
                  title="Reject"
                >
                  Reject
                </button>
              </>}

            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "IsPaused",
        header: "Paused",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const { LnAID } = row.original;
          const [toggling, setToggling] = React.useState(false);

          // Always reflect API source of truth; do not store separate local copy
          const isPausedFromApi = !!row.original.IsPaused;

          const onTogglePause = async (e) => {
            const newVal = e.target.checked;
            // Optimistic UI is minimal: disable control during request; actual value rebinds from API refresh
            setToggling(true);
            try {
              await API.put(`/LnAs/PauseLoan/${LnAID}?pause=${newVal}`);
              notification().success(`Loan ${newVal ? "paused" : "resumed"} successfully!`);
              // Refresh to fetch latest server state; table rebinds and checkbox reflects API value
              getEmployeeRequest && getEmployeeRequest();
            } catch (err) {
              console.error("Failed to update pause state:", err);
              notification().error("Failed to update pause state.");
              // No local flip; since we read from API value, it remains consistent
            } finally {
              setToggling(false);
            }
          };

          return (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isPausedFromApi}
                onChange={onTogglePause}
                disabled={toggling || row.original.IsForceClosed}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-blue-600"></div>
            </label>
          );
        },
        size: 120,
      },
      {
        accessorKey: "IsForceClosed",
        header: "Force Close",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const { LnAID } = row.original;
          const [toggling, setToggling] = React.useState(false);

          // Read-only from API; do not maintain separate local value
          const isForceClosedFromApi = !!row.original.IsForceClosed;

          const onToggleForceClose = async (e) => {
            const newVal = e.target.checked;
            // One-way enable only
            if (!newVal) return;
            setToggling(true);
            try {
              await API.put(`/LnAs/ForceCloseLoan/${LnAID}`);
              notification().success("Loan force-closed successfully!");
              getEmployeeRequest && getEmployeeRequest();
            } catch (err) {
              console.error("Failed to force close loan:", err);
              notification().error("Failed to force close loan.");
            } finally {
              setToggling(false);
            }
          };

          return (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isForceClosedFromApi}
                onChange={onToggleForceClose}
                disabled={toggling || isForceClosedFromApi}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-red-600"></div>
            </label>
          );
        },
        size: 140,
      },
    ],
    []
  );

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    let updatedConfig = { ...repaymentConfig, [name]: value };

    if (name === "emi" && selectedEmployee?.Amount) {
      const emiValue = parseFloat(value);
      const loanAmount = parseFloat(selectedEmployee.Amount);

      if (!isNaN(emiValue) && emiValue > 0) {
        updatedConfig.installments = Math.ceil(loanAmount / emiValue);
      } else {
        updatedConfig.installments = "";
      }
    }

    setRepaymentConfig(updatedConfig);
  };

  // const handleSaveRepaymentSettings = async () => {
  //   if (!selectedEmployee)
  //     return notification().warning("Select an employee first");

  //   try {
  //     await API.put(`/LnAs/${selectedEmployee.LnAID}`, {
  //       LnAID: selectedEmployee.LnAID,
  //       EmpID: selectedEmployee.EmpID || 0, // Add EmpID to your data fetch if missing
  //       LoanAmount: selectedEmployee.Amount || 0,
  //       Period: Number(repaymentConfig.installments),
  //       InterestRate: Number(repaymentConfig.interest) || 0,
  //       MonthlyInstallment: Number(repaymentConfig.emi),
  //       StartDate: repaymentConfig.startDate,
  //       IsApproved: selectedEmployee.Status === "Approved",
  //       Description: selectedEmployee.Description || "", // optional field
  //     });

  //     notification().success("Repayment settings updated successfully!");
  //     getEmployeeRequest();
  //   } catch (error) {
  //     console.error("Failed to update repayment settings:", error);
  //     notification().error("Failed to update repayment settings.");
  //   }
  // };

  return (
    <div className="mt-5">
      {/* Section 1: Active Loans Tracker */}
      <div className="bg-white p-6 rounded shadow-lg mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FaMoneyBillWave className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Active Loans & Advances
          </h2>
        </div>
        <div className="">
          <TableService
            ref={tableRef}
            columns={columns}
            data={loans}
            initialPageSize={5}
            serverPagination={true}
            pageCount={totalPages}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPaginationChange={handlePaginationChange}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            onRefresh={getEmployeeRequest}
          />
        </div>
      </div>

      {/* Section 2: Repayment Configurator */}
      {/* <div className="bg-white p-6 rounded shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FaCogs className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Configure Repayment Schedule
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-gray-700">EMI Amount</span>
            <input
              type="number"
              name="emi"
              value={repaymentConfig.emi}
              onChange={handleConfigChange}
              className="mt-1 block w-full border rounded px-3 py-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter fixed EMI amount"
            />
            <p className="text-xs text-gray-500">
              Period: {repaymentConfig.installments}
            </p>
          </label>
          <label className="block">
            <span className="text-gray-700">Start Date</span>
            <input
              type="date"
              name="startDate"
              value={repaymentConfig.startDate}
              onChange={handleConfigChange}
              className="mt-1 block w-full border rounded px-3 py-2 focus:ring-blue-500 focus:outline-none"
            />
          </label>
        </div>
        <button
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          onClick={handleSaveRepaymentSettings}
        >
          Save Repayment Settings
        </button>
      </div> */}
    </div>
  );
}

export default LoanAdminDashboard;
