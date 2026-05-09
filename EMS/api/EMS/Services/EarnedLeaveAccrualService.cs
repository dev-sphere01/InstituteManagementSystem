using EMS.Data;
using EMS.Models;
using Microsoft.EntityFrameworkCore;

namespace EMS.Services
{
    public class EarnedLeaveAccrualService
    {
        private readonly EMSDbContext _context;

        public EarnedLeaveAccrualService(EMSDbContext context)
        {
            _context = context;
        }

        public async Task ProcessDailyAccrualAsync()
        {
            var today = DateTime.UtcNow.Date;
            var currentYear = today.Year;

            var earnedLeaveMaster = await _context.LeaveMasters
                .FirstOrDefaultAsync(lm => lm.LeaveType == "Earned");

            if (earnedLeaveMaster == null)
                return;

            var confirmedEmployees = await _context.Employees
                .Where(e => e.IsProbationComplete == true && e.IsActive)
                .ToListAsync();

            foreach (var employee in confirmedEmployees)
            {
                await AccrueLeaveForEmployeeAsync(employee, earnedLeaveMaster, today, currentYear);
            }
        }

        private async Task AccrueLeaveForEmployeeAsync(Employee employee, LeaveMaster earnedLeaveMaster, 
            DateTime today, int currentYear)
        {
            var leaveBalance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmpID == employee.EmpID && 
                                          lb.LeaveMasterID == earnedLeaveMaster.LeaveMasterID && 
                                          lb.Year == currentYear);

            if (leaveBalance == null)
            {
                leaveBalance = new LeaveBalance
                {
                    EmpID = employee.EmpID,
                    LeaveMasterID = earnedLeaveMaster.LeaveMasterID,
                    Year = currentYear,
                    OpeningBalance = 0,
                    Availed = 0,
                    Adjusted = 0,
                    ClosingBalance = 0,
                    TotalAccrued = 0,
                    LastAccrualDate = today
                };
                _context.LeaveBalances.Add(leaveBalance);
            }

            var accrualStartDate = leaveBalance.LastAccrualDate ?? GetYearStartForEmployee(employee, currentYear);
           /* Console.WriteLine($"Processing Accrual for EmpID: {employee.EmpID}, From: {accrualStartDate.ToShortDateString()} To: {today.ToShortDateString()}");
            Task.Delay(1000).Wait();*/
            var eligibleDaysCount = await CalculateEligibleDaysAsync(employee, accrualStartDate, today, currentYear);
            /*Console.WriteLine($"Eligible Days for EmpID: {employee.EmpID} = {eligibleDaysCount}");
            Task.Delay(1000).Wait();*/

            if (eligibleDaysCount < 20)
            {
                leaveBalance.LastAccrualDate = today;
                await _context.SaveChangesAsync();
                return;
            }

            var accrualDays = (decimal)eligibleDaysCount / 20m;
            leaveBalance.TotalAccrued = (leaveBalance.TotalAccrued ?? 0) + accrualDays;
            leaveBalance.ClosingBalance = (int)Math.Floor(leaveBalance.TotalAccrued ?? 0);
            leaveBalance.LastAccrualDate = today;

            await _context.SaveChangesAsync();
        }

        private DateTime GetYearStartForEmployee(Employee employee, int year)
        {
            if (!string.IsNullOrEmpty(employee.DateOfJoining) && DateTime.TryParse(employee.DateOfJoining, out var joiningDate))
            {
                if (joiningDate.Year == year)
                    return joiningDate.Date;
                if (joiningDate.Year < year)
                    return new DateTime(year, 1, 1);
            }
            return new DateTime(year, 1, 1);
        }

        private async Task<int> CalculateEligibleDaysAsync(Employee employee, DateTime startDate, 
            DateTime endDate, int year)
        {
            var holidays = await _context.Holidays
                .Where(h => h.Year == year && h.Date >= startDate && h.Date <= endDate)
                .Select(h => h.Date.Date)
                .ToListAsync();

            var customWeeklyOffs = await _context.WeeklyOffConfigurations
                .Where(w => w.EmpID == employee.EmpID && 
                           w.IsActive && 
                           w.EffectiveDate <= endDate && 
                           (w.EndDate == null || w.EndDate >= startDate))
                .ToListAsync();

            var approvedLeaves = await _context.Leaves
                .Where(l => l.EmpID == employee.EmpID && 
                           l.IsApproved == true &&
                           l.StartDate >= startDate && 
                           l.EndDate <= endDate)
                .ToListAsync();

            var approvedLeaveDates = new HashSet<DateTime>();
            foreach (var leave in approvedLeaves)
            {
                if (leave.StartDate.HasValue && leave.EndDate.HasValue)
                {
                    var current = leave.StartDate.Value.Date;
                    var to = leave.EndDate.Value.Date;
                    while (current <= to)
                    {
                        approvedLeaveDates.Add(current);
                        current = current.AddDays(1);
                    }
                }
            }

            int eligibleDays = 0;
            var current_date = startDate;

            while (current_date <= endDate)
            {
                if (IsEligibleDay(current_date, holidays, customWeeklyOffs, approvedLeaveDates))
                    eligibleDays++;

                current_date = current_date.AddDays(1);
            }

            return eligibleDays;
        }

        private bool IsEligibleDay(DateTime date, List<DateTime> holidays, 
            List<WeeklyOffConfiguration> customWeeklyOffs, HashSet<DateTime> approvedLeaveDates)
        {
            if (approvedLeaveDates.Contains(date.Date))
                return false;

            if (holidays.Contains(date.Date))
                return false;

            var customWeeklyOff = customWeeklyOffs.FirstOrDefault(w =>
                w.EffectiveDate <= date && (w.EndDate == null || w.EndDate >= date));

            if (customWeeklyOff != null && customWeeklyOff.DayOfWeek == date.DayOfWeek.ToString())
                return false;

            if (customWeeklyOff == null && date.DayOfWeek == DayOfWeek.Sunday)
                return false;

            return true;
        }
    }
}
