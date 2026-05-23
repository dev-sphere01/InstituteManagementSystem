import React from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';

const Row = ({ label, value }) => (
  <tr>
    <td className="py-1 text-gray-600 w-1/2">{label}</td>
    <td className="py-1 font-medium text-right">{fmt(value)}</td>
  </tr>
);

const SalarySlipPrint = ({ slip, empName, month, year }) => {
  if (!slip) return null;

  const earnings = [
    ['Earned Salary', slip.EarnedSalary],
    ['Travel Allowance', slip.Travel],
    ['Food Allowance', slip.Food],
    ['Mobile Allowance', slip.Mobile],
    ['Other Allowance', slip.OtherAllowance],
    ['Bonus', slip.Bonus],
    ['Other Income', slip.OtherIncome],
    ['Holiday Pay', slip.HolidayPay],
  ].filter(([, v]) => v > 0);

  const deductions = [
    ['Absent Deduction', slip.AbsentDeduction],
    ['Half-Day Deduction', slip.HalfDayDeduction],
    ['Total Fines', slip.TotalFine],
    ['Salary Holding', slip.HoldingAmount],
  ].filter(([, v]) => v > 0);

  const totalEarnings = earnings.reduce((a, [, v]) => a + (v || 0), 0);
  const totalDeductions = deductions.reduce((a, [, v]) => a + (v || 0), 0);

  return (
    <div id="salary-slip-print" className="max-w-2xl mx-auto p-8 bg-white text-gray-900 text-sm print:shadow-none shadow-lg rounded-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">Salary Slip</h1>
        <p className="text-gray-500">{MONTHS[month - 1]} {year}</p>
      </div>

      {/* Employee info */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-gray-500 text-xs">Employee Name</p>
          <p className="font-semibold">{empName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Month / Year</p>
          <p className="font-semibold">{MONTHS[month - 1]} {year}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Working Days</p>
          <p className="font-semibold">{slip.WorkingDays}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Present Days</p>
          <p className="font-semibold">{slip.PresentDays}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Absent Days</p>
          <p className="font-semibold">{slip.AbsentDays}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Late Days</p>
          <p className="font-semibold">{slip.LateDays}</p>
        </div>
      </div>

      {/* Earnings & Deductions side by side */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-green-700 border-b pb-1 mb-2">Earnings</h3>
          <table className="w-full text-sm">
            <tbody>
              {earnings.map(([label, value]) => <Row key={label} label={label} value={value} />)}
              <tr className="border-t font-bold">
                <td className="pt-2">Total Earnings</td>
                <td className="pt-2 text-right text-green-700">{fmt(totalEarnings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-semibold text-red-700 border-b pb-1 mb-2">Deductions</h3>
          <table className="w-full text-sm">
            <tbody>
              {deductions.length === 0 ? (
                <tr><td colSpan={2} className="text-gray-400 text-center py-2">No deductions</td></tr>
              ) : deductions.map(([label, value]) => <Row key={label} label={label} value={value} />)}
              <tr className="border-t font-bold">
                <td className="pt-2">Total Deductions</td>
                <td className="pt-2 text-right text-red-700">{fmt(totalDeductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Pay */}
      <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4 rounded-lg">
        <span className="text-lg font-semibold">Net Pay</span>
        <span className="text-2xl font-bold">{fmt(slip.NetPay)}</span>
      </div>

      {/* Print controls — hidden when printing */}
      <div className="flex justify-end mt-6 print:hidden">
        <button onClick={() => window.print()} className="btn btn-primary btn-sm">Print / Save PDF</button>
      </div>
    </div>
  );
};

export default SalarySlipPrint;
