import React, { useEffect, useState, useRef } from 'react';
import { API, notification } from '@/services';
import { FaChevronDown, FaChevronUp, FaFilter, FaFileExcel, FaPrint, FaFilePdf } from 'react-icons/fa';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { hasPermission } from '@/pages/Masters/Positions/components/hasPermissionService';

const LoanReports = () => {
  const [activeTab, setActiveTab] = useState('allLoans');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    approvalStatus: 'all',
    searchTerm: '',
  });

  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesMonth, setBalancesMonth] = useState(new Date().getMonth() + 1);
  const [balancesYear, setBalancesYear] = useState(new Date().getFullYear());
  const [balancesCurrentPage, setBalancesCurrentPage] = useState(1);
  const [balancesItemsPerPage, setBalancesItemsPerPage] = useState(10);
  const [balancesExpandedRow, setBalancesExpandedRow] = useState(null);

  const debounceTimer = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchLoansReport();
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [filters]);

  const fetchLoansReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.status === 'active') {
        params.append('isActive', 'true');
      } else if (filters.status === 'inactive') {
        params.append('isActive', 'false');
      }

      if (filters.approvalStatus === 'approved') {
        params.append('isApproved', 'true');
      } else if (filters.approvalStatus === 'rejected') {
        params.append('isApproved', 'false');
      }

      if (filters.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
      }

      const response = await API.get(`/LnAs/GetAllLoansReport?${params.toString()}`);
      if (response.data && Array.isArray(response.data)) {
        setLoans(response.data);
      } else {
        notification().error('Failed to fetch loans report');
      }
    } catch (error) {
      console.error('Error fetching loans report:', error);
      notification().error('Error fetching loans report');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyBalances = async (month, year) => {
    setBalancesLoading(true);
    try {
      const response = await API.get(`/LnAs/GetAllBalances/${month}/${year}`);
      if (response.data && Array.isArray(response.data)) {
        setBalances(response.data);
        setBalancesCurrentPage(1);
      } else {
        notification().error('Failed to fetch monthly balances');
      }
    } catch (error) {
      console.error('Error fetching monthly balances:', error);
      notification().error('Error fetching monthly balances');
      setBalances([]);
    } finally {
      setBalancesLoading(false);
    }
  };

  const isLoanActive = (loan) => {
    return !loan.isForceClosed && !loan.isPaused && (loan.balances && loan.balances.length > 0);
  };

  const getOutstandingBalance = (loan) => {
    if (!loan.balances || loan.balances.length === 0) return 0;
    const latest = loan.balances[0];
    return latest.ClosingBalance || 0;
  };

  const handleExportToExcel = () => {
    if (loans.length === 0) {
      notification().warning('No data to export');
      return;
    }

    const headers = [
      'Loan ID',
      'Employee Name',
      'Loan Amount',
      'Monthly Installment',
      'Outstanding Balance',
      'Period (Months)',
      'Start Date',
      'Status',
      'Approval Status',
    ];

    const data = loans.map((loan) => [
      loan.LnAID,
      loan.EmployeeName,
      loan.LoanAmount,
      loan.MonthlyInstallment,
      getOutstandingBalance(loan),
      loan.Period,
      loan.StartDate ? new Date(loan.StartDate).toLocaleDateString() : 'N/A',
      isLoanActive(loan) ? 'Active' : 'Inactive',
      loan.IsApproved === true ? 'Approved' : loan.IsApproved === false ? 'Rejected' : 'Pending',
    ]);

    const csvContent = [headers, ...data].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loan_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notification().success('Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportBalancesToExcel = () => {
    if (balances.length === 0) {
      notification().warning('No data to export');
      return;
    }

    const headers = [
      'Employee Name',
      'Loan Amount',
      'Monthly EMI',
      'Opening Balance',
      'Amount Recovered',
      'Closing Balance',
      'Approval Status',
    ];

    const data = balances.map((balance) => [
      balance.EmployeeName,
      balance.LoanAmount,
      balance.MonthlyInstallment,
      balance.OpeningBalance,
      balance.AmountRecovered,
      balance.ClosingBalance,
      balance.IsApproved === true ? 'Approved' : balance.IsApproved === false ? 'Rejected' : 'Pending',
    ]);

    const csvContent = [headers, ...data].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly_balances_${balancesMonth}_${balancesYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notification().success('Report exported successfully');
  };

  const handleExportBalancesToPDF = () => {
    if (balances.length === 0) {
      notification().warning('No data to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const title = `Monthly Balances Report - ${moment().month(balancesMonth - 1).format('MMMM')} ${balancesYear}`;
    doc.setFontSize(16);
    doc.text(title, pageWidth / 2, 15, { align: 'center' });

    const headers = [
      'Employee Name',
      'Loan Amount',
      'Monthly EMI',
      'Opening Balance',
      'Amount Recovered',
      'Closing Balance',
      'Approval Status',
    ];

    const data = balances.map((balance) => [
      balance.EmployeeName,
      `₹${balance.LoanAmount?.toLocaleString('en-IN') || 0}`,
      `₹${balance.MonthlyInstallment?.toLocaleString('en-IN') || 0}`,
      `₹${balance.OpeningBalance?.toLocaleString('en-IN') || 0}`,
      `₹${balance.AmountRecovered?.toLocaleString('en-IN') || 0}`,
      `₹${balance.ClosingBalance?.toLocaleString('en-IN') || 0}`,
      balance.IsApproved === true ? 'Approved' : balance.IsApproved === false ? 'Rejected' : 'Pending',
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 25,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    const totalRecords = balances.length;
    const totalLoanAmount = balances.reduce((sum, balance) => sum + (balance.LoanAmount || 0), 0);
    const totalRecovered = balances.reduce((sum, balance) => sum + (balance.AmountRecovered || 0), 0);
    const totalClosingBalance = balances.reduce((sum, balance) => sum + (balance.ClosingBalance || 0), 0);

    const finalY = (doc).lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Records: ${totalRecords}`, 15, finalY);
    doc.text(`Total Loan Amount: ₹${totalLoanAmount.toLocaleString('en-IN')}`, 15, finalY + 7);
    doc.text(`Total Amount Recovered: ₹${totalRecovered.toLocaleString('en-IN')}`, 15, finalY + 14);
    doc.text(`Total Closing Balance: ₹${totalClosingBalance.toLocaleString('en-IN')}`, 15, finalY + 21);

    doc.save(`monthly_balances_${balancesMonth}_${balancesYear}.pdf`);
    notification().success('PDF exported successfully');
  };

  const StatusBadge = ({ isApproved }) => {
    if (isApproved === true) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
    } else if (isApproved === false) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
  };

  const ActiveBadge = ({ isActive }) => {
    return isActive ? (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Active</span>
    ) : (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>
    );
  };

  const totalPages = Math.ceil(loans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLoans = loans.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const balancesTotalPages = Math.ceil(balances.length / balancesItemsPerPage);
  const balancesStartIndex = (balancesCurrentPage - 1) * balancesItemsPerPage;
  const balancesEndIndex = balancesStartIndex + balancesItemsPerPage;
  const paginatedBalances = balances.slice(balancesStartIndex, balancesEndIndex);

  const handleBalancesItemsPerPageChange = (newItemsPerPage) => {
    setBalancesItemsPerPage(newItemsPerPage);
    setBalancesCurrentPage(1);
  };

  const goToBalancesPage = (page) => {
    setBalancesCurrentPage(Math.max(1, Math.min(page, balancesTotalPages)));
  };

  const handleMonthYearChange = () => {
    fetchMonthlyBalances(balancesMonth, balancesYear);
  };

  const canExport = hasPermission('loan_management.loan_reports.export')

  return (
    <div className="mt-5 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Loans & Advances Reports</h1>
        <p className="text-gray-600">View and analyze all employee loans and advances</p>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('allLoans')}
            className={`px-6 py-3 font-medium transition ${activeTab === 'allLoans'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            All Loans
          </button>
          <button
            onClick={() => setActiveTab('monthlyBalances')}
            className={`px-6 py-3 font-medium transition ${activeTab === 'monthlyBalances'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Monthly Balances
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        {activeTab === 'allLoans' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Employee name or description"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Approval Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
              <select
                value={filters.approvalStatus}
                onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Action Buttons */}
            {canExport &&
              <div className="flex items-end gap-2">
                <button
                  onClick={handleExportToExcel}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  title="Export to CSV"
                >
                  <FaFileExcel className="text-lg" />
                  Export
                </button>

                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  title="Print Report"
                >
                  <FaPrint className="text-lg" />
                  Print
                </button>
              </div>
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Month Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={balancesMonth}
                onChange={(e) => setBalancesMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {moment().month(month - 1).format('MMMM')}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={balancesYear}
                onChange={(e) => setBalancesYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleMonthYearChange}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Fetch Data
              </button>
            </div>
          </div>
        )}

        {/* Export Buttons for Monthly Balances */}
        {activeTab === 'monthlyBalances' && balances.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300 flex flex-col md:flex-row gap-2">
            <button
              onClick={handleExportBalancesToExcel}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
              title="Export to CSV"
            >
              <FaFileExcel className="text-lg" />
              Export to Excel
            </button>
            <button
              onClick={handleExportBalancesToPDF}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              title="Export to PDF"
            >
              <FaFilePdf className="text-lg" />
              Export to PDF
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      {activeTab === 'allLoans' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                Loading reports...
              </div>
            </div>
          ) : loans.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500 text-lg">No loans found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loan Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Outstanding</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Monthly EMI</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Approval</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoans.map((loan, index) => (
                    <React.Fragment key={loan.LnAID}>
                      <tr
                        className="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() =>
                          setExpandedRow(expandedRow === loan.LnAID ? null : loan.LnAID)
                        }
                      >
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {loan.EmployeeName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          ₹{loan.LoanAmount?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                          ₹{getOutstandingBalance(loan).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          ₹{loan.MonthlyInstallment?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-6 py-4">
                          <ActiveBadge isActive={isLoanActive(loan)} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge isApproved={loan.IsApproved} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          {expandedRow === loan.LnAID ? (
                            <FaChevronUp className="text-blue-600 mx-auto" />
                          ) : (
                            <FaChevronDown className="text-gray-400 mx-auto" />
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row - Balance Details */}
                      {expandedRow === loan.LnAID && (
                        <tr className="bg-blue-50 border-b-2 border-blue-200">
                          <td colSpan="7" className="px-6 py-6">
                            <div className="space-y-4">
                              {/* Loan Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 font-semibold uppercase">Start Date</p>
                                  <p className="text-lg font-bold text-gray-800">
                                    {loan.StartDate ? moment(loan.StartDate).format('DD MMM YYYY') : 'N/A'}
                                  </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 font-semibold uppercase">Period</p>
                                  <p className="text-lg font-bold text-gray-800">{loan.Period} months</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 font-semibold uppercase">Interest Rate</p>
                                  <p className="text-lg font-bold text-gray-800">{loan.InterestRate || 0}%</p>
                                </div>
                              </div>

                              {/* Description */}
                              {loan.Description && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Description</p>
                                  <p className="text-sm text-gray-700">{loan.Description}</p>
                                </div>
                              )}

                              {/* Balance History Table */}
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                  <h3 className="font-semibold text-gray-800">Payment History</h3>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                          Month/Year
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                                          Opening Balance
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                                          Amount Recovered
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                                          Closing Balance
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {loan.balances && loan.balances.length > 0 ? (
                                        loan.balances.map((balance, idx) => (
                                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-800 font-medium">
                                              {balance.Month}/{balance.Year}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                              ₹{balance.OpeningBalance?.toLocaleString('en-IN') || 0}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                              ₹{balance.AmountRecovered?.toLocaleString('en-IN') || 0}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                              ₹{balance.ClosingBalance?.toLocaleString('en-IN') || 0}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                            No balance records available
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {loans.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Items Per Page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 font-medium">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>

                {/* Pagination Info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, loans.length)}</span> of <span className="font-semibold">{loans.length}</span> records
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={page} className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Summary */}
          {loans.length > 0 && (
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{loans.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Loan Amount</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{loans.reduce((sum, loan) => sum + (loan.LoanAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{loans.reduce((sum, loan) => sum + getOutstandingBalance(loan), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Monthly EMI</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{loans.reduce((sum, loan) => sum + (loan.MonthlyInstallment || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {balancesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                Loading monthly balances...
              </div>
            </div>
          ) : balances.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500 text-lg">No balances found for selected month/year</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loan Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Monthly EMI</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Opening Balance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount Recovered</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Closing Balance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBalances.map((balance) => (
                    <tr key={balance.LnABalanceID} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {balance.EmployeeName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        ₹{balance.LoanAmount?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        ₹{balance.MonthlyInstallment?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        ₹{balance.OpeningBalance?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                        ₹{balance.AmountRecovered?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold text-red-600">
                        ₹{balance.ClosingBalance?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge isApproved={balance.IsApproved} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls for Balances */}
          {balances.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Items Per Page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 font-medium">Show:</label>
                  <select
                    value={balancesItemsPerPage}
                    onChange={(e) => handleBalancesItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>

                {/* Pagination Info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{balancesStartIndex + 1}</span> to <span className="font-semibold">{Math.min(balancesEndIndex, balances.length)}</span> of <span className="font-semibold">{balances.length}</span> records
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToBalancesPage(balancesCurrentPage - 1)}
                    disabled={balancesCurrentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: balancesTotalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === balancesTotalPages ||
                        (page >= balancesCurrentPage - 1 && page <= balancesCurrentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToBalancesPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${balancesCurrentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        (page === balancesCurrentPage - 2 && balancesCurrentPage > 3) ||
                        (page === balancesCurrentPage + 2 && balancesCurrentPage < balancesTotalPages - 2)
                      ) {
                        return (
                          <span key={page} className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => goToBalancesPage(balancesCurrentPage + 1)}
                    disabled={balancesCurrentPage === balancesTotalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Summary for Balances */}
          {balances.length > 0 && (
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{balances.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Loan Amount</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{balances.reduce((sum, balance) => sum + (balance.LoanAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount Recovered</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{balances.reduce((sum, balance) => sum + (balance.AmountRecovered || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Closing Balance</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{balances.reduce((sum, balance) => sum + (balance.ClosingBalance || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanReports;
