using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using EMS.Services;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EarnedLeavesController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly EarnedLeaveAccrualService _accrualService;
        private readonly EarnedLeaveEncashmentService _encashmentService;

        public EarnedLeavesController(EMSDbContext context, 
            EarnedLeaveAccrualService accrualService,
            EarnedLeaveEncashmentService encashmentService)
        {
            _context = context;
            _accrualService = accrualService;
            _encashmentService = encashmentService;
        }

        [HttpGet("balance/{empId}/{year}")]
        public async Task<ActionResult<object>> GetEarnedLeaveBalance(int empId, int year)
        {
            var employee = await _context.Employees.FindAsync(empId);
            if (employee == null)
                return NotFound("Employee not found");

            var earnedLeaveMaster = await _context.LeaveMasters
                .FirstOrDefaultAsync(lm => lm.LeaveType == "Earned");

            if (earnedLeaveMaster == null)
                return BadRequest("Earned Leave type not configured");

            var leaveBalance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmpID == empId && 
                                          lb.LeaveMasterID == earnedLeaveMaster.LeaveMasterID && 
                                          lb.Year == year);

            if (leaveBalance == null)
            {
                return Ok(new
                {
                    empId,
                    year,
                    totalAccrued = 0,
                    availed = 0,
                    balance = 0,
                    encashedAmount = 0,
                    lastAccrualDate = (DateTime?)null
                });
            }

            return Ok(new
            {
                empId,
                year,
                totalAccrued = leaveBalance.TotalAccrued ?? 0,
                availed = leaveBalance.Availed,
                balance = leaveBalance.ClosingBalance,
                encashedAmount = leaveBalance.EncashedAmount ?? 0,
                lastAccrualDate = leaveBalance.LastAccrualDate
            });
        }

        [HttpGet("accrual-history/{empId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAccrualHistory(int empId)
        {
            var employee = await _context.Employees.FindAsync(empId);
            if (employee == null)
                return NotFound("Employee not found");

            var earnedLeaveMaster = await _context.LeaveMasters
                .FirstOrDefaultAsync(lm => lm.LeaveType == "Earned");

            if (earnedLeaveMaster == null)
                return BadRequest("Earned Leave type not configured");

            var accrualHistory = await _context.LeaveBalances
                .Where(lb => lb.EmpID == empId && 
                            lb.LeaveMasterID == earnedLeaveMaster.LeaveMasterID)
                .OrderBy(lb => lb.Year)
                .Select(lb => new
                {
                    year = lb.Year,
                    totalAccrued = lb.TotalAccrued ?? 0,
                    availed = lb.Availed,
                    closingBalance = lb.ClosingBalance,
                    lastAccrualDate = lb.LastAccrualDate
                })
                .ToListAsync();

            return Ok(accrualHistory);
        }

        [HttpGet("encashment-history/{empId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetEncashmentHistory(int empId)
        {
            var employee = await _context.Employees.FindAsync(empId);
            if (employee == null)
                return NotFound("Employee not found");

            var encashmentHistory = await _context.LeaveEncashments
                .Where(le => le.EmpID == empId)
                .OrderBy(le => le.Year)
                .Select(le => new
                {
                    year = le.Year,
                    leaveBalance = le.LeaveBalance,
                    encashmentAmount = le.EncashmentAmount,
                    encashmentDate = le.EncashmentDate,
                    status = le.Status
                })
                .ToListAsync();

            return Ok(encashmentHistory);
        }

        [HttpPost("process-accrual")]
        public async Task<IActionResult> ProcessDailyAccrual()
        {
            try
            {
                await _accrualService.ProcessDailyAccrualAsync();
                return Ok(new { message = "Daily accrual processed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("process-encashment/{year}")]
        public async Task<IActionResult> ProcessYearEndEncashment(int year)
        {
            try
            {
                await _encashmentService.ProcessYearEndEncashmentAsync(year);
                return Ok(new { message = $"Year-end encashment for {year} processed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("eligible-accrual/{empId}/{fromDate}/{toDate}")]
        public async Task<ActionResult<object>> GetEligibleAccrualDays(int empId, string fromDate, string toDate)
        {
            try
            {
                if (!DateTime.TryParse(fromDate, out var start) || !DateTime.TryParse(toDate, out var end))
                    return BadRequest("Invalid date format");

                var employee = await _context.Employees.FindAsync(empId);
                if (employee == null)
                    return NotFound("Employee not found");

                var eligibleDays = await CalculateEligibleDaysAsync(empId, start, end);

                var accrualDays = (decimal)eligibleDays / 20m;

                return Ok(new
                {
                    empId,
                    fromDate = start.Date,
                    toDate = end.Date,
                    eligibleDays,
                    accrualDays = Math.Round(accrualDays, 2)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private async Task<int> CalculateEligibleDaysAsync(int empId, DateTime startDate, DateTime endDate)
        {
            var year = startDate.Year;
            var holidays = await _context.Holidays
                .Where(h => h.Year == year && h.Date >= startDate && h.Date <= endDate)
                .Select(h => h.Date.Date)
                .ToListAsync();

            var customWeeklyOffs = await _context.WeeklyOffConfigurations
                .Where(w => w.EmpID == empId && 
                           w.IsActive && 
                           w.EffectiveDate <= endDate && 
                           (w.EndDate == null || w.EndDate >= startDate))
                .ToListAsync();

            var approvedLeaves = await _context.Leaves
                .Where(l => l.EmpID == empId && 
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
            var currentDate = startDate;

            while (currentDate <= endDate)
            {
                if (IsEligibleDay(currentDate, holidays, customWeeklyOffs, approvedLeaveDates))
                    eligibleDays++;

                currentDate = currentDate.AddDays(1);
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
