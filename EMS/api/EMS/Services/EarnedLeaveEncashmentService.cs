using EMS.Data;
using EMS.Models;
using Microsoft.EntityFrameworkCore;

namespace EMS.Services
{
    public class EarnedLeaveEncashmentService
    {
        private readonly EMSDbContext _context;

        public EarnedLeaveEncashmentService(EMSDbContext context)
        {
            _context = context;
        }

        public async Task ProcessYearEndEncashmentAsync(int year)
        {
            var earnedLeaveMaster = await _context.LeaveMasters
                .FirstOrDefaultAsync(lm => lm.LeaveType == "Earned Leave");

            if (earnedLeaveMaster == null || !earnedLeaveMaster.IsEncashable)
                return;

            var leaveBalances = await _context.LeaveBalances
                .Where(lb => lb.Year == year && 
                            lb.LeaveMasterID == earnedLeaveMaster.LeaveMasterID &&
                            lb.ClosingBalance > 0)
                .ToListAsync();

            var encashmentDate = new DateTime(year, 12, 31);

            foreach (var balance in leaveBalances)
            {
                await ProcessEncashmentForEmployeeAsync(balance, earnedLeaveMaster, encashmentDate);
            }
        }

        private async Task ProcessEncashmentForEmployeeAsync(LeaveBalance balance, 
            LeaveMaster earnedLeaveMaster, DateTime encashmentDate)
        {
            var employee = await _context.Employees.FindAsync(balance.EmpID);
            if (employee == null)
                return;

            var ctcRecord = await _context.EmpCTCandPayrolls
                .Where(c => c.EmpID == balance.EmpID)
                .OrderByDescending(c => c.EffectiveDate)
                .FirstOrDefaultAsync();

            if (ctcRecord == null || ctcRecord.BasicSalary <= 0)
                return;

            var basicSalaryPerDay = ctcRecord.BasicSalary / 30m;
            var encashmentAmount = balance.ClosingBalance * basicSalaryPerDay;

            var encashmentRecord = new LeaveEncashment
            {
                EmpID = balance.EmpID,
                LeaveMasterID = earnedLeaveMaster.LeaveMasterID,
                Year = balance.Year,
                LeaveBalance = balance.ClosingBalance,
                EncashmentAmount = encashmentAmount,
                EncashmentDate = encashmentDate,
                Status = "Processed",
                CreatedAt = DateTime.UtcNow
            };

            _context.LeaveEncashments.Add(encashmentRecord);

            balance.EncashedAmount = encashmentAmount;
            balance.ClosingBalance = 0;

            await _context.SaveChangesAsync();
        }

        public async Task<decimal> GetEncashmentAmountAsync(int empId, int year)
        {
            var encashment = await _context.LeaveEncashments
                .Where(le => le.EmpID == empId && le.Year == year)
                .SumAsync(le => le.EncashmentAmount);

            return encashment;
        }
    }
}
