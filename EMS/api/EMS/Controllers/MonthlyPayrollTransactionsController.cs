using EMS.Data;
using EMS.Migrations;
using EMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EMS.Services;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MonthlyPayrollTransactionsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public MonthlyPayrollTransactionsController(EMSDbContext context, Services.IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/MonthlyPayrollTransactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MonthlyPayrollTransaction>>> GetMonthlyPayrollTransactions()
        {
            return await _context.MonthlyPayrollTransactions.ToListAsync();
        }

        // GET: api/MonthlyPayrollTransactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MonthlyPayrollTransaction>> GetMonthlyPayrollTransaction(int id)
        {
            var monthlyPayrollTransaction = await _context.MonthlyPayrollTransactions.FindAsync(id);

            if (monthlyPayrollTransaction == null)
            {
                return NotFound();
            }

            return monthlyPayrollTransaction;
        }

        // PUT: api/MonthlyPayrollTransactions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMonthlyPayrollTransaction(int id, MonthlyPayrollTransaction monthlyPayrollTransaction)
        {
            if (id != monthlyPayrollTransaction.MptID)
            {
                return BadRequest();
            }

            var oldTransaction = await _context.MonthlyPayrollTransactions.AsNoTracking().FirstOrDefaultAsync(t => t.MptID == id);
            _context.Entry(monthlyPayrollTransaction).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                await _logger.LogActivityAsync(
                    "Payroll",
                    "Update Monthly Transaction",
                    $"Updated monthly payroll transaction ID {id} for employee ID {monthlyPayrollTransaction.EmpID} for {monthlyPayrollTransaction.Month}/{monthlyPayrollTransaction.Year}",
                    monthlyPayrollTransaction.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldTransaction),
                    System.Text.Json.JsonSerializer.Serialize(monthlyPayrollTransaction)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MonthlyPayrollTransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<object>> PostMonthlyPayrollTransaction(int month, int year)
        {
            if (month < 1 || month > 12)
                return BadRequest("Month must be between 1 and 12.");

            if (year < 1 || year > 9999)
                return BadRequest("Year must be between 1 and 9999.");

            var existingTransactions = await _context.MonthlyPayrollTransactions
                .Where(t => t.Month == month && t.Year == year)
                .Select(t => t.EmpID)
                .ToListAsync();

            var existingEmpSet = new HashSet<int>(existingTransactions);
            var allEmployees = await _context.Employees
                .Where(e => e.OBStatus == true && e.IsActive == true)
                .ToListAsync();

            var activeEmployeeIds = allEmployees.Select(e => e.EmpID).ToHashSet();

            var hourlyEmployeeIds = (await (
                from edp in _context.EmpDeptPositions
                where edp.EmpTypeID == 2 && activeEmployeeIds.Contains(edp.EmpID)
                select edp.EmpID
            ).ToListAsync()).ToHashSet();

            var fixedEmployees = allEmployees
                .Where(emp => !hourlyEmployeeIds.Contains(emp.EmpID))
                .ToList();

            var payrollDate = new DateTime(year, month, 1);

            var attendanceTotals = await _context.AttendanceTotalHours
                .Where(t => t.Month == month && t.Year == year)
                .ToListAsync();

            var empHoursMap = attendanceTotals.ToDictionary(
                t => t.EmpID,
                t => (decimal)t.StandardizedTotalHours
            );

            var payroll = await _context.EmpCTCandPayrolls.ToListAsync();
            var penalties = await _context.Penalties.ToListAsync();
            var otherAllowances = await _context.OtherAllowances.ToListAsync();

            var transactionsToAdd = new List<MonthlyPayrollTransaction>();

            // === Hourly employees ===
            foreach (var empId in hourlyEmployeeIds)
            {
                if (existingEmpSet.Contains(empId)) continue;
                if (!empHoursMap.ContainsKey(empId)) continue;

                var totalHours = empHoursMap[empId]; //This is now StandardizedTotalHours
                var payrollData = payroll.FirstOrDefault(p => p.EmpID == empId);
                if (payrollData == null) continue;

                decimal basicSalary = payrollData.BasicSalary;
                decimal hourlyRate = payrollData.HourlyRate ?? 0;

                var slabs = await _context.PayrollSlabs.OrderBy(s => s.MinHours).ToListAsync();
                decimal netSalaryPayment = 0;

                foreach (var slab in slabs)
                {
                    if (totalHours >= slab.MinHours &&
                        (slab.MaxHours == null || totalHours <= slab.MaxHours))
                    {
                        if (slab.IsFlatBasic)
                        {
                            netSalaryPayment = basicSalary;
                        }
                        else if (slab.IsPenalty)
                        {
                            netSalaryPayment = (slab.Multiplier == 0)
                                ? totalHours * hourlyRate
                                : basicSalary - ((200 - totalHours) * hourlyRate);
                        }
                        else
                        {
                            var basePay = basicSalary * slab.Multiplier;
                            var extraHours = Math.Max(0, totalHours - slab.MinHours);
                            netSalaryPayment = basePay + (extraHours * hourlyRate);
                        }
                        break;
                    }
                }

                decimal esi = payrollData.EsiApplicable ? Math.Round(netSalaryPayment * 0.0075m, 2) : 0;
                decimal epf = payrollData.EpfApplicable
                    ? (payrollData.EPFEmployee > (netSalaryPayment * 0.12m)
                        ? (netSalaryPayment * 0.12m)
                        : payrollData.EPFEmployee)
                    : 0;
                decimal rd = payrollData.RD ?? 0;
                decimal healthInsurance = payrollData.HealthInsurance ?? 0;

                // ✅ Fetch penalty & other allowance
                decimal penalty = penalties.FirstOrDefault(p =>
                    p.EmpID == empId &&
                    p.DeductionDate.Month == month &&
                    p.DeductionDate.Year == year)?.Amount ?? 0;

                decimal otherAllowance = otherAllowances
    .Where(o => o.EmpID == empId &&
        (o.StartDate == null || o.StartDate <= payrollDate) &&
        (o.EndDate == null || o.EndDate >= payrollDate))
    .Sum(o => o.Amount) ?? 0;

                var transaction = new MonthlyPayrollTransaction
                {
                    EmpID = empId,
                    Month = month,
                    Year = year,
                    BasicSalary = payrollData.BasicSalary,
                    HRA = payrollData.Hra,
                    DA = payrollData.Da,
                    esi = esi,
                    EPF = epf,
                    RD = rd,
                    HealthInsurance = healthInsurance,
                    Penalty = penalty,
                    OtherAllowances = otherAllowance, // store for reference
                    TotalHours = totalHours
                };

                // ✅ NetPay includes allowance & excludes penalty
                transaction.NetPay = Math.Round(
                    netSalaryPayment
                    + (transaction.HRA ?? 0)
                    + (transaction.DA ?? 0)
                    + otherAllowance
                    - epf
                    - esi
                    - rd
                    - healthInsurance
                    - penalty, 0);

                transaction.Deductions = Math.Round(epf + esi + rd + healthInsurance + penalty, 0);

                var loanResult = await ProcessLoansAndAdvances(empId, transaction, payrollDate, month, year);
                transaction.Advances = loanResult.Disbursed;
                transaction.LoanAndAdvanceRepayment = loanResult.Recovered;
                transaction.NetPay -= transaction.LoanAndAdvanceRepayment;
                transaction.Deductions += transaction.LoanAndAdvanceRepayment;

                // ✅ Arrears calculation
                var pendingArrears = await _context.EmpIncrements
                    .Where(i => i.EmpID == empId && i.IsProcessed && !i.ArrearsPaid && i.ArrearsAmount > 0)
                    .ToListAsync();
                var arrearid = "";
                if (pendingArrears.Any())
                {
                    decimal totalArrears = pendingArrears.Sum(a => a.ArrearsAmount);
                    transaction.Arrears = totalArrears;
                    transaction.NetPay += totalArrears;

                    foreach (var arr in pendingArrears)
                    {
                        arrearid += arr.IncrementID.ToString() + ",";
                        arr.ArrearsPaid = true;
                    }
                }
                transaction.ArrearID = arrearid.TrimEnd(',');
                transactionsToAdd.Add(transaction);
            }

            // === Fixed employees ===
            foreach (var emp in fixedEmployees)
            {
                if (existingEmpSet.Contains(emp.EmpID)) continue;

                var payrollData = payroll.FirstOrDefault(p => p.EmpID == emp.EmpID);
                if (payrollData == null) continue;

                decimal gross = payrollData.BasicSalary + payrollData.Hra + payrollData.Da;

                decimal esi = payrollData.EsiApplicable ? Math.Round(gross * 0.0075m, 2) : 0;
                decimal epf = payrollData.EpfApplicable ? payrollData.EPFEmployee : 0;
                decimal rd = payrollData.RD ?? 0;
                decimal healthInsurance = payrollData.HealthInsurance ?? 0;

                // ✅ Fetch penalty & other allowance for fixed employees too
                decimal penalty = penalties.FirstOrDefault(p =>
                    p.EmpID == emp.EmpID &&
                    p.DeductionDate.Month == month &&
                    p.DeductionDate.Year == year)?.Amount ?? 0;

                decimal otherAllowance = otherAllowances
     .Where(o => o.EmpID == emp.EmpID &&
         (o.StartDate == null || o.StartDate <= payrollDate) &&
         (o.EndDate == null || o.EndDate >= payrollDate))
     .Sum(o => o.Amount) ?? 0;

                var transaction = new MonthlyPayrollTransaction
                {
                    EmpID = emp.EmpID,
                    Month = month,
                    Year = year,
                    BasicSalary = payrollData.BasicSalary,
                    HRA = payrollData.Hra,
                    DA = payrollData.Da,
                    EPF = epf,
                    esi = esi,
                    RD = rd,
                    HealthInsurance = healthInsurance,
                    Penalty = penalty,
                    OtherAllowances = otherAllowance,
                    TotalHours = empHoursMap.ContainsKey(emp.EmpID) ? (int)empHoursMap[emp.EmpID] : 0
                };

                transaction.NetPay = Math.Round(
                    gross
                    + otherAllowance
                    - epf
                    - esi
                    - rd
                    - healthInsurance
                    - penalty, 0);

                transaction.Deductions = Math.Round(epf + esi + rd + healthInsurance + penalty, 0);

                var loanResult = await ProcessLoansAndAdvances(emp.EmpID, transaction, payrollDate, month, year);
                transaction.Advances = loanResult.Disbursed;
                transaction.LoanAndAdvanceRepayment = loanResult.Recovered;
                transaction.NetPay -= transaction.LoanAndAdvanceRepayment;
                transaction.Deductions += transaction.LoanAndAdvanceRepayment;

                // ✅ Arrears calculation
                var pendingArrears = await _context.EmpIncrements
                    .Where(i => i.EmpID == emp.EmpID && i.IsProcessed && !i.ArrearsPaid && i.ArrearsAmount > 0)
                    .ToListAsync();
                var arrearid = "";

                if (pendingArrears.Any())
                {
                    decimal totalArrears = pendingArrears.Sum(a => a.ArrearsAmount);
                    transaction.Arrears = totalArrears;
                    transaction.NetPay += totalArrears;

                    foreach (var arr in pendingArrears)
                    {
                        arrearid+= arr.IncrementID.ToString() + ",";
                        arr.ArrearsPaid = true;
                    }
                }
                transaction.ArrearID = arrearid.TrimEnd(',');

                transactionsToAdd.Add(transaction);
            }

            _context.MonthlyPayrollTransactions.AddRange(transactionsToAdd);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Process Monthly Payroll",
                $"Processed monthly payroll for {month}/{year}. Created {transactionsToAdd.Count} transactions.",
                "all",
                null,
                null
            );

            return Ok(new
            {
                Message = $"{transactionsToAdd.Count} new payroll transactions created successfully.",
                Skipped = existingEmpSet.Count
            });
        }


        [HttpGet("Get3MonthsData")]
        public async Task<ActionResult<object>> Get3MonthsData(int EmpID)
        {
            var emp = await _context.Employees.FindAsync(EmpID);
            if (emp == null)
                return NotFound("Employee not found.");

            int month = DateTime.Today.Month - 1;
            int year = DateTime.Today.Year;

            var salarySlips = new List<object>();

            for (int count = 0; count < 3; count++)
            {
                var transaction = await _context.MonthlyPayrollTransactions
                    .FirstOrDefaultAsync(e => e.Month == month && e.Year == year && e.EmpID == emp.EmpID);
                var attendance = await _context.Attendances
                    .Where(a => a.Date.HasValue && a.Date.Value.Month == month && a.AtdEmpCode == emp.AtdEmpCode).ToListAsync();
                var dayscount = attendance.Count;

                if (transaction != null)
                {
                    var slip = new
                    {
                        period = new DateTime(year, month, 1).ToString("MMMM yyyy").ToUpper(), // e.g. "MARCH 2025"
                        salaryDetails = new
                        {
                            actualPayableDays = 25,
                            totalWorkingDays = dayscount,
                            lossOfPayDays = 25 - dayscount,
                            daysPayable = dayscount
                        },
                        earnings = new
                        {
                            basic = transaction.BasicSalary,
                            hra = transaction.HRA,
                            da = transaction.DA,
                            arrears = transaction.Arrears ?? 0,
                            total = (transaction.BasicSalary ?? 0) + (transaction.HRA ?? 0) + (transaction.DA ?? 0) + (transaction.Arrears ?? 0)
                        },
                        deductions = new
                        {
                            pfEmployee = transaction.EPF,
                            esi = transaction.esi,
                            rd = transaction.RD,
                            healthInsurance = transaction.HealthInsurance,
                            total = transaction.Deductions
                        },
                        netSalary = new
                        {
                            amount = transaction.NetPay,
                        }
                    };

                    salarySlips.Add(slip);
                }

                // Move to previous month
                month--;
                if (month == 0)
                {
                    month = 12;
                    year--;
                }
            }

            var result = new
            {
                salarySlips
            };

            return Ok(result);
        }



        [HttpGet("PayrollTransactionDetails/{year:int}/{month:int}")]
        public async Task<ActionResult<object>> GetPayrollTransactionDetails(int year, int month)
        {
            var transactions = await (
                from t in _context.MonthlyPayrollTransactions
                join e in _context.Employees on t.EmpID equals e.EmpID
                join b in _context.EmpBankDetails on e.EmpID equals b.EmpID into bankJoin
                from b in bankJoin.DefaultIfEmpty()
                select new
                {
                    t.MptID,
                    t.EmpID,
                    EmployeeName = e.FirstName + " " + (e.LastName ?? ""),
                    e.PersonalEmail,
                    e.WorkEmail,
                    e.PhoneNumber,
                    e.Address,
                    e.DateOfJoining,
                    // Bank details
                    BankName = b != null ? b.BankName : null,
                    AccountNumber = b != null ? b.AccountNumber : null,
                    IFSCCode = b != null ? b.IFSCCode : null,
                    BranchName = b != null ? b.BranchName : null,
                    // Payroll details
                    t.Month,
                    t.Year,
                    t.BasicSalary,
                    t.HRA,
                    t.DA,
                    t.Advances,
                    t.LoanAndAdvanceRepayment,
                    t.RD,
                    t.HealthInsurance,
                    t.EPF,
                    t.esi,
                    t.Deductions,
                    t.NetPay,
                    t.TransactionDate,
                    t.Arrears
                }
            )
            .Where(x => x.Year == year && x.Month == month)
            .ToListAsync();

            if (!transactions.Any())
            {
                return NotFound("No payroll transactions found for the given month/year.");
            }

            // Summation of NetPay
            var netSalaryToBeTransferred = transactions.Sum(x => x.NetPay ?? 0);

            return Ok(new
            {
                NetSalaryToBeTransferred = netSalaryToBeTransferred,
                Transactions = transactions
            });
        }





        // ================== HELPER FOR LOANS ==================
        private async Task<LoanAndAdvanceResult> ProcessLoansAndAdvances(
    int empId,
    MonthlyPayrollTransaction transaction,
    DateTime payrollDate,
    int Month,
    int Year)
        {
            var result = new LoanAndAdvanceResult();

            var employeeLoans = await _context.LnAs
                .Where(l => l.EmpID == empId && l.IsApproved == true && l.isForceClosed == false && l.isPaused == false)
                .ToListAsync();

            foreach (var loan in employeeLoans)
            {
                if (!loan.StartDate.HasValue || !loan.LoanAmount.HasValue || !loan.Period.HasValue)
                    continue;

                // === Case 0: One-time arrear/advance payments ===
                if (loan.IsArrearOrAdvance == true)
                {
                    if (loan.StartDate.Value.Month == payrollDate.Month && loan.StartDate.Value.Year == payrollDate.Year)
                    {
                        decimal arrearAmount = (decimal)loan.LoanAmount.Value;

                        transaction.NetPay += arrearAmount;
                        result.Disbursed += arrearAmount;

                        bool exists = await _context.LnABalances
                            .AnyAsync(b => b.LnAID == loan.LnAID && b.Month == Month && b.Year == Year);

                        if (!exists)
                        {
                            _context.LnABalances.Add(new LnABalance
                            {
                                LnAID = loan.LnAID,
                                EmpID = loan.EmpID,
                                Month = Month,
                                Year = Year,
                                OpeningBalance = 0,
                                ClosingBalance = 0,
                                AmountRecovered = 0
                            });
                        }
                    }
                    continue;
                }

                var loanStart = loan.StartDate.Value;
                var deductionStart =new DateTime(loanStart.Year, loanStart.Month, 1).AddMonths(1);
                var loanEnd = loanStart.AddMonths(loan.Period.Value);
                var salaryMonthDate = new DateTime(Year, Month, 1);
                var lastInstallmentMonth =
    new DateTime(loanStart.Year, loanStart.Month, 1)
        .AddMonths(loan.Period.Value);

                var empActive = await _context.Employees
                    .Where(e => e.EmpID == empId)
                    .Select(e => e.IsActive)
                    .FirstOrDefaultAsync();

                if (!empActive)
                    continue;

                // === Case 1: Loan disbursement month ===
                if (loanStart.Month == payrollDate.Month && loanStart.Year == payrollDate.Year)
                {
                    decimal loanAmount = (decimal)loan.LoanAmount.Value;

                    //transaction.NetPay += loanAmount;   OG Logic 
                    //new Logic so that if loan starts on 30th or 28th Feb, amount is added to net pay
                    if ((loanStart.Day == 30) || (loanStart.Month == 2 && loanStart.Day == 28))
                    {
                        transaction.NetPay += loanAmount;
                    }
                    result.Disbursed += loanAmount;

                    bool exists = await _context.LnABalances
                        .AnyAsync(b => b.LnAID == loan.LnAID && b.Month == Month && b.Year == Year);

                    if (!exists)
                    {
                        _context.LnABalances.Add(new LnABalance
                        {
                            LnAID = loan.LnAID,
                            EmpID = loan.EmpID,
                            Month = Month,
                            Year = Year,
                            OpeningBalance = 0,
                            ClosingBalance = loan.LoanAmount,
                            AmountRecovered = 0
                        });
                    }
                }
                // === Case 2: Installments during loan period ===
                else if (salaryMonthDate >= deductionStart &&
         salaryMonthDate <= lastInstallmentMonth)
                {
                    // Check if balance entry already exists for this month
                    var currentBalance = await _context.LnABalances
                        .FirstOrDefaultAsync(b => b.LnAID == loan.LnAID && b.Month == Month && b.Year == Year);

                    if (currentBalance != null)
                    {
                        // Deduct whatever amount is already recorded for this month
                        if (currentBalance.AmountRecovered > 0)
                        {
                            result.Recovered += (decimal)currentBalance.AmountRecovered;
                            // transaction.NetPay -= (decimal)currentBalance.AmountRecovered; // Uncomment if salary deduction needed
                        }
                        continue; // Skip creating a new entry
                    }

                    // Calculate opening balance as total loan - sum of recovered amounts up to previous month
                    var totalRecovered = await _context.LnABalances
                        .Where(b => b.LnAID == loan.LnAID &&
                                    (b.Year < Year || (b.Year == Year && b.Month < Month)))
                        .SumAsync(b => (double?)b.AmountRecovered) ?? 0;

                    double openingBalance = (double)loan.LoanAmount.Value - totalRecovered;

                    if (openingBalance <= 0)
                        continue; // Loan already fully recovered, nothing to deduct

                    double monthlyInstallment = (double)(loan.MonthlyInstallment ?? 0);
                    double amountToRecover = Math.Min(openingBalance, monthlyInstallment);
                    double closingBalance = openingBalance - amountToRecover;

                    result.Recovered += (decimal)amountToRecover;
                    //transaction.NetPay -= (decimal)amountToRecover; // Deduct from payroll

                    // Create LnABalance for this payroll month
                    _context.LnABalances.Add(new LnABalance
                    {
                        LnAID = loan.LnAID,
                        EmpID = loan.EmpID,
                        Month = Month,
                        Year = Year,
                        OpeningBalance = openingBalance,
                        ClosingBalance = closingBalance,
                        AmountRecovered = amountToRecover
                    });
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }



        // DELETE: api/MonthlyPayrollTransactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMonthlyPayrollTransaction(int id)
        {
            var monthlyPayrollTransaction = await _context.MonthlyPayrollTransactions.FindAsync(id);
            if (monthlyPayrollTransaction == null)
            {
                return NotFound();
            }

            // Roll back arrears status
            await RollbackArrears(monthlyPayrollTransaction.ArrearID);

            _context.MonthlyPayrollTransactions.Remove(monthlyPayrollTransaction);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Payroll",
                "Delete Monthly Transaction",
                $"Deleted monthly payroll transaction ID {id} for employee ID {monthlyPayrollTransaction.EmpID} for {monthlyPayrollTransaction.Month}/{monthlyPayrollTransaction.Year}",
                monthlyPayrollTransaction.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(monthlyPayrollTransaction),
                null
            );

            return NoContent();
        }

        [HttpDelete("ByMonthandYear")]
        public async Task<IActionResult> DeleteMonthlyPayrollTransaction(int Year, int Month)
        {
            var monthlyPayrollTransactions = await _context.MonthlyPayrollTransactions
                .Where(mtp => mtp.Month == Month && mtp.Year == Year)
                .ToListAsync();

            if (monthlyPayrollTransactions == null || !monthlyPayrollTransactions.Any())
            {
                return NotFound();
            }

            // Roll back arrears status for all transactions being deleted
            foreach (var transaction in monthlyPayrollTransactions)
            {
                await RollbackArrears(transaction.ArrearID);
            }

            _context.MonthlyPayrollTransactions.RemoveRange(monthlyPayrollTransactions);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Payroll",
                "Bulk Delete Monthly Transactions",
                $"Deleted all monthly payroll transactions for {Month}/{Year} ({monthlyPayrollTransactions.Count} records)",
                "all",
                null,
                null
            );

            return NoContent();
        }

        private async Task RollbackArrears(string? arrearIds)
        {
            if (string.IsNullOrEmpty(arrearIds)) return;

            var ids = arrearIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(s => int.TryParse(s, out int id) ? id : (int?)null)
                               .Where(id => id.HasValue)
                               .Select(id => id!.Value)
                               .ToList();

            if (!ids.Any()) return;

            var increments = await _context.EmpIncrements
                .Where(i => ids.Contains(i.IncrementID))
                .ToListAsync();

            foreach (var increment in increments)
            {
                increment.ArrearsPaid = false;
            }
        }

        private bool MonthlyPayrollTransactionExists(int id)
        {
            return _context.MonthlyPayrollTransactions.Any(e => e.MptID == id);
        }
    }

    public class LoanAndAdvanceResult
    {
        public decimal Disbursed { get; set; }   // Amount given to employee
        public decimal Recovered { get; set; }   // Amount deducted from salary
    }
}
