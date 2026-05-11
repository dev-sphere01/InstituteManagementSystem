using EMS.Data;
using EMS.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EMS.Services
{
    public class SimplePayrollService
    {
        private readonly EMSDbContext _context;

        public SimplePayrollService(EMSDbContext context)
        {
            _context = context;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Working Days = calendar days - Sundays - non-working PayrollHolidays
        // ──────────────────────────────────────────────────────────────────────
        public async Task<int> GetWorkingDays(int month, int year, int locationId)
        {
            var daysInMonth = DateTime.DaysInMonth(year, month);

            int sundays = 0;
            for (int d = 1; d <= daysInMonth; d++)
                if (new DateTime(year, month, d).DayOfWeek == DayOfWeek.Sunday)
                    sundays++;

            int nonWorkingHolidays = await _context.PayrollHolidays
                .Where(h => h.LocationId == locationId
                         && !h.IsWorkingDay
                         && h.Date.Year == year
                         && h.Date.Month == month)
                .CountAsync();

            return daysInMonth - sundays - nonWorkingHolidays;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Late fine using configurable slabs
        // Example: [{1→3: ₹0}, {4→5: ₹50}, {6→∞: ₹100}]
        // For 7 late days: 3×0 + 2×50 + 2×100 = ₹300
        // ──────────────────────────────────────────────────────────────────────
        public decimal CalculateLateFine(int lateDays, List<FineSlab> slabs)
        {
            if (lateDays <= 0 || slabs == null || !slabs.Any()) return 0;

            var ordered = slabs.OrderBy(s => s.FromCount).ToList();
            decimal totalFine = 0;
            int remaining = lateDays;

            foreach (var slab in ordered)
            {
                if (remaining <= 0) break;
                int slabSize = slab.ToCount.HasValue
                    ? slab.ToCount.Value - slab.FromCount + 1
                    : remaining;
                int applicable = Math.Min(remaining, slabSize);
                totalFine += applicable * slab.FinePerOccurrence;
                remaining -= applicable;
            }
            return totalFine;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Determine attendance status for a single attendance record
        // Returns: Present, Late, HalfDay, HolidayWorking, Leave, Absent
        // ──────────────────────────────────────────────────────────────────────
        private string DetermineStatus(Attendance rec, ShiftRule? rule, bool isHolidayWorkingDay)
        {
            if (isHolidayWorkingDay && rec.CheckInTime.HasValue)
                return "HolidayWorking";

            if (!rec.CheckInTime.HasValue)
                return "Absent";

            if (rule == null)
                return "Present";

            if (!TimeOnly.TryParse(rule.ShiftStart, out var shiftStart))
                return "Present";

            var checkIn = rec.CheckInTime.Value;
            double lateMinutes = (checkIn - shiftStart).TotalMinutes;

            if (lateMinutes <= rule.GracePeriodMins) return "Present";
            if (lateMinutes <= rule.LateThresholdMins) return "Late";
            if (lateMinutes <= rule.HalfDayThresholdMins) return "HalfDay";
            return "HalfDay"; // beyond half-day threshold = half day
        }

        // ──────────────────────────────────────────────────────────────────────
        // Process payroll for a single employee for a given month/year
        // ──────────────────────────────────────────────────────────────────────
        public async Task<SimplePayroll> ProcessPayroll(int empId, int month, int year, string imsUserId)
        {
            var employee = await _context.Employees.FindAsync(empId)
                ?? throw new InvalidOperationException($"Employee {empId} not found.");

            if (!employee.IsActive)
                throw new InvalidOperationException($"Employee {empId} is inactive.");

            int locationId = employee.LocationID ?? 0;

            // Working days for the branch
            int workingDays = locationId > 0
                ? await GetWorkingDays(month, year, locationId)
                : DateTime.DaysInMonth(year, month) - 4;

            // Shift rules for the branch
            var shiftRule = locationId > 0
                ? await _context.ShiftRules.FirstOrDefaultAsync(r => r.LocationId == locationId)
                : null;

            // Non-working holidays (to skip from absent count)
            var nonWorkingHolidayDates = await _context.PayrollHolidays
                .Where(h => h.LocationId == locationId
                         && !h.IsWorkingDay
                         && h.Date.Year == year
                         && h.Date.Month == month)
                .Select(h => h.Date)
                .ToListAsync();

            // Working holidays (employee can get holiday pay for these)
            var workingHolidayDates = await _context.PayrollHolidays
                .Where(h => h.LocationId == locationId
                         && h.IsWorkingDay
                         && h.Date.Year == year
                         && h.Date.Month == month)
                .Select(h => h.Date)
                .ToListAsync();

            // Attendance records for this employee in this month
            var attendanceRecords = await _context.Attendances
                .Where(a => a.EmpID == empId
                         && a.Date.HasValue
                         && a.Date.Value.Year == year
                         && a.Date.Value.Month == month)
                .ToListAsync();

            var attendanceByDate = attendanceRecords
                .Where(a => a.Date.HasValue)
                .GroupBy(a => DateOnly.FromDateTime(a.Date!.Value))
                .ToDictionary(g => g.Key, g => g.First());

            // Count attendance statuses across all working days
            int presentDays = 0, absentDays = 0, halfDays = 0, lateDays = 0,
                holidayWorkingDays = 0, leaveDays = 0;

            int daysInMonth = DateTime.DaysInMonth(year, month);
            for (int d = 1; d <= daysInMonth; d++)
            {
                var date = new DateOnly(year, month, d);
                var dateTime = date.ToDateTime(TimeOnly.MinValue);

                if (dateTime.DayOfWeek == DayOfWeek.Sunday) continue;
                if (nonWorkingHolidayDates.Contains(date)) continue;

                bool isWorkingHoliday = workingHolidayDates.Contains(date);

                if (attendanceByDate.TryGetValue(date, out var rec))
                {
                    var status = DetermineStatus(rec, shiftRule, isWorkingHoliday);
                    switch (status)
                    {
                        case "Present": presentDays++; break;
                        case "Late": lateDays++; break;
                        case "HalfDay": halfDays++; break;
                        case "HolidayWorking": holidayWorkingDays++; break;
                        case "Leave": leaveDays++; break;
                        default: absentDays++; break;
                    }
                }
                else
                {
                    absentDays++;
                }
            }

            // Salary
            var salaryAssignment = await _context.SalaryAssignments
                .Where(s => s.EmpID == empId && s.IsActive)
                .OrderByDescending(s => s.EffectiveDate)
                .FirstOrDefaultAsync()
                ?? throw new InvalidOperationException($"No active salary assignment for employee {empId}.");

            decimal monthlySalary = salaryAssignment.MonthlySalary;
            decimal dailySalary = workingDays > 0
                ? Math.Round(monthlySalary / workingDays, 2)
                : 0;

            // Present + Late = full day; HalfDay = 0.5; HolidayWorking = full day
            decimal effectiveDays = presentDays + lateDays + holidayWorkingDays + (halfDays * 0.5m);
            decimal earnedSalary = Math.Round(effectiveDays * dailySalary, 2);
            decimal holidayPay = Math.Round(holidayWorkingDays * dailySalary, 2);

            // Allowances
            var allowance = await _context.MonthlyAllowances
                .FirstOrDefaultAsync(a => a.EmpID == empId && a.Month == month && a.Year == year);

            decimal travel = allowance?.Travel ?? 0;
            decimal food = allowance?.Food ?? 0;
            decimal mobile = allowance?.Mobile ?? 0;
            decimal other = allowance?.Other ?? 0;
            decimal bonus = allowance?.Bonus ?? 0;
            decimal otherIncome = allowance?.OtherIncome ?? 0;

            // Deductions
            decimal absentDeduction = Math.Round(absentDays * dailySalary, 2);
            decimal halfDayDeduction = Math.Round(halfDays * dailySalary * 0.5m, 2);

            // Late fine
            decimal autoLateFine = 0;
            if (locationId > 0 && lateDays > 0)
            {
                var lateFineRule = await _context.LateFineRules
                    .FirstOrDefaultAsync(r => r.LocationId == locationId);
                if (lateFineRule != null && !string.IsNullOrEmpty(lateFineRule.SlabsJson))
                {
                    var slabs = JsonSerializer.Deserialize<List<FineSlab>>(lateFineRule.SlabsJson)
                                ?? new List<FineSlab>();
                    autoLateFine = CalculateLateFine(lateDays, slabs);
                }
            }

            decimal manualFinesTotal = await _context.EmployeeFines
                .Where(f => f.EmpID == empId && f.Month == month && f.Year == year)
                .SumAsync(f => f.Amount);

            decimal totalFine = autoLateFine + manualFinesTotal;

            // Holdings active this month
            var startOfMonth = new DateOnly(year, month, 1);
            var endOfMonth = new DateOnly(year, month, daysInMonth);

            var activeHoldings = await _context.SalaryHoldings
                .Where(h => h.EmpID == empId && h.Status == "Active"
                         && (h.Month == month && h.Year == year
                             || (h.FromDate.HasValue && h.ToDate.HasValue
                                 && h.FromDate <= endOfMonth && h.ToDate >= startOfMonth)))
                .ToListAsync();
            decimal holdingAmount = activeHoldings.Sum(h => h.Amount);

            // Net Pay
            decimal netPay = earnedSalary
                           + holidayPay + travel + food + mobile + other + bonus + otherIncome
                           - absentDeduction - halfDayDeduction
                           - totalFine
                           - holdingAmount;
            netPay = Math.Max(0, Math.Round(netPay, 2));

            // Upsert
            var existing = await _context.SimplePayrolls
                .FirstOrDefaultAsync(p => p.EmpID == empId && p.Month == month && p.Year == year);

            if (existing?.Status == "Approved")
                throw new InvalidOperationException($"Payroll for employee {empId} {month}/{year} is locked (Approved).");

            var payroll = existing ?? new SimplePayroll { EmpID = empId, Month = month, Year = year };
            payroll.Status = "Processed";
            payroll.WorkingDays = workingDays;
            payroll.PresentDays = presentDays;
            payroll.AbsentDays = absentDays;
            payroll.HalfDays = halfDays;
            payroll.LateDays = lateDays;
            payroll.HolidayWorkingDays = holidayWorkingDays;
            payroll.LeaveDays = leaveDays;
            payroll.MonthlySalary = monthlySalary;
            payroll.DailySalary = dailySalary;
            payroll.EarnedSalary = earnedSalary;
            payroll.HolidayPay = holidayPay;
            payroll.TravelAllowance = travel;
            payroll.FoodAllowance = food;
            payroll.MobileAllowance = mobile;
            payroll.OtherAllowance = other;
            payroll.Bonus = bonus;
            payroll.OtherIncome = otherIncome;
            payroll.AbsentDeduction = absentDeduction;
            payroll.HalfDayDeduction = halfDayDeduction;
            payroll.TotalFine = totalFine;
            payroll.HoldingAmount = holdingAmount;
            payroll.NetPay = netPay;
            payroll.ProcessedByImsId = imsUserId;
            payroll.ProcessedAt = DateTime.UtcNow;
            payroll.UpdatedAt = DateTime.UtcNow;

            if (existing == null) _context.SimplePayrolls.Add(payroll);
            else _context.SimplePayrolls.Update(payroll);

            await _context.SaveChangesAsync();
            return payroll;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Process all active employees in a branch
        // ──────────────────────────────────────────────────────────────────────
        public async Task<(int Success, int Failed, List<string> Errors)> ProcessBranchPayroll(
            int locationId, int month, int year, string imsUserId)
        {
            var empIds = await _context.Employees
                .Where(e => e.LocationID == locationId && e.IsActive)
                .Select(e => e.EmpID)
                .ToListAsync();

            int success = 0, failed = 0;
            var errors = new List<string>();

            foreach (var empId in empIds)
            {
                try
                {
                    await ProcessPayroll(empId, month, year, imsUserId);
                    success++;
                }
                catch (Exception ex)
                {
                    failed++;
                    errors.Add($"EmpID {empId}: {ex.Message}");
                }
            }

            return (success, failed, errors);
        }

        // ──────────────────────────────────────────────────────────────────────
        // Auto-create joining hold on first salary assignment
        // Join day 1–15 → hold till month end; day 16+ → hold for 30 days
        // ──────────────────────────────────────────────────────────────────────
        public async Task CreateJoiningHoldIfRequired(int empId, decimal monthlySalary, string imsUserId)
        {
            var employee = await _context.Employees.FindAsync(empId);
            if (employee == null || string.IsNullOrEmpty(employee.DateOfJoining)) return;

            var alreadyExists = await _context.SalaryHoldings
                .AnyAsync(h => h.EmpID == empId && h.HoldingType == "JoiningHold");
            if (alreadyExists) return;

            if (!DateOnly.TryParse(employee.DateOfJoining, out var joiningDate)) return;

            decimal holdAmount = Math.Round(monthlySalary * 0.5m, 2);
            DateOnly toDate = joiningDate.Day <= 15
                ? new DateOnly(joiningDate.Year, joiningDate.Month,
                    DateTime.DaysInMonth(joiningDate.Year, joiningDate.Month))
                : joiningDate.AddDays(30);

            _context.SalaryHoldings.Add(new SalaryHolding
            {
                EmpID = empId,
                HoldingType = "JoiningHold",
                FromDate = joiningDate,
                ToDate = toDate,
                Amount = holdAmount,
                Month = joiningDate.Month,
                Year = joiningDate.Year,
                Reason = "Joining hold (auto-generated)",
                Status = "Active",
                CreatedByImsId = imsUserId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }
    }
}
