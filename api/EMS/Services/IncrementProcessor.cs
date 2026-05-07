using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EMS.Data;
using EMS.Models;

namespace EMS.Services
{
    public class IncrementProcessor : IIncrementProcessor
    {
        private readonly EMSDbContext _context;
        private readonly ILogger<IncrementProcessor> _logger;

        public IncrementProcessor(EMSDbContext context, ILogger<IncrementProcessor> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<int> ProcessPendingIncrementsAsync()
        {
            var today = DateTime.Today;
            int processedCount = 0;

            var pendingIncrements = await _context.EmpIncrements
                .Where(i => i.ApprovalStatus == "Approved" && !i.IsProcessed && i.WEFDate.Date <= today)
                .ToListAsync();

            if (!pendingIncrements.Any())
                return 0;

            foreach (var increment in pendingIncrements)
            {
                try
                {
                    var currentPayroll = await _context.EmpCTCandPayrolls
                        .Where(p => p.EmpID == increment.EmpID)
                        .OrderByDescending(p => p.EffectiveDate)
                        .FirstOrDefaultAsync();

                    if (currentPayroll != null && currentPayroll.GrossSalary > 0)
                    {
                        decimal oldGross = currentPayroll.GrossSalary;
                        decimal newGross = oldGross + increment.IncrementAmount;
                        decimal ratio = newGross / oldGross;
                        decimal newCtc = increment.NewCTC;

                        // Calculate Arrears if WEF is in the past
                        decimal arrears = 0;
                        if (increment.WEFDate.Date < today.Date)
                        {
                            decimal oldMonthly = oldGross;
                            decimal newMonthly = newGross;
                            decimal monthlyDiff = newMonthly - oldMonthly;

                            // If WEF is the 1st of the month, use the simple month difference
                            if (increment.WEFDate.Day == 1)
                            {
                                int monthsDiff = ((today.Year - increment.WEFDate.Year) * 12) + today.Month - increment.WEFDate.Month;
                                arrears = monthlyDiff * Math.Max(0, monthsDiff);
                            }
                            else
                            {
                                // Handle partial month for the start month
                                int daysInWefMonth = DateTime.DaysInMonth(increment.WEFDate.Year, increment.WEFDate.Month);
                                int partialDays = daysInWefMonth - increment.WEFDate.Day + 1;
                                decimal partialMonthArrears = (monthlyDiff / daysInWefMonth) * partialDays;

                                // Full months from the next month onwards
                                DateTime nextMonth = new DateTime(increment.WEFDate.Year, increment.WEFDate.Month, 1).AddMonths(1);
                                int fullMonths = ((today.Year - nextMonth.Year) * 12) + today.Month - nextMonth.Month;

                                arrears = partialMonthArrears + (monthlyDiff * Math.Max(0, fullMonths));
                            }
                        }

                        // Update existing entry
                        currentPayroll.CtcAmount = newCtc;
                        currentPayroll.BasicSalary = Math.Round(currentPayroll.BasicSalary * ratio, 2);
                        currentPayroll.MonthlyBasicPay = currentPayroll.MonthlyBasicPay != null ? Math.Round(currentPayroll.MonthlyBasicPay.Value * ratio, 2) : null;
                        currentPayroll.Hra = Math.Round(currentPayroll.Hra * ratio, 2);
                        currentPayroll.Da = Math.Round(currentPayroll.Da * ratio, 2);
                        currentPayroll.Lta = Math.Round(currentPayroll.Lta * ratio, 2);
                        currentPayroll.SpecialAllowance = Math.Round(currentPayroll.SpecialAllowance * ratio, 2);
                        currentPayroll.PerformanceBonus = Math.Round(currentPayroll.PerformanceBonus * ratio, 2);
                        currentPayroll.GrossSalary = newGross;
                        currentPayroll.NetAnnualSalary = Math.Round(currentPayroll.NetAnnualSalary * ratio, 2);
                        currentPayroll.NetMonthlyPayable = Math.Round(currentPayroll.NetMonthlyPayable * ratio, 2);
                        
                        // Recalculate EPF correctly instead of using ratio
                        if (currentPayroll.EpfApplicable)
                        {
                            currentPayroll.EPFEmployee = Math.Round(Math.Min(currentPayroll.BasicSalary * 0.12m, 1800m), 2);
                        }
                        else
                        {
                            currentPayroll.EPFEmployee = 0;
                        }

                        currentPayroll.HourlyRate = currentPayroll.HourlyRate != null ? currentPayroll.HourlyRate * ratio : null;
                        currentPayroll.EffectiveDate = increment.WEFDate;

                        // Mark as processed
                        increment.IsProcessed = true;
                        increment.ProcessedDate = DateTime.Now;
                        increment.ArrearsAmount = Math.Round(arrears, 2);

                        processedCount++;
                        _logger.LogInformation($"Updated current payroll for EmpID {increment.EmpID}. New CTC: {newCtc}, Arrears: {arrears}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to process increment ID {increment.IncrementID}");
                }
            }

            await _context.SaveChangesAsync();
            return processedCount;
        }
    }
}
