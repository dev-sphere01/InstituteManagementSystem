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
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Linq.Expressions;
using EMS.Models.NonDBModels;
using System.Security.Claims;
using DocumentFormat.OpenXml.Vml;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LnAsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public LnAsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }


        [HttpPost("Search")]
        public async Task<ActionResult<PaginatedResponse<object>>> GetLnAs([FromBody] LnASearchRequest request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            if (request.SortField == null) request.SortField = "LnAID"; // Default sort field
            if (request.SortOrder != null && request.SortOrder.ToLower() != "asc" && request.SortOrder.ToLower() != "desc")
                request.SortOrder = "desc"; // Default to ascending if invalid value provided

            // Step 1: Get latest balances (per EmpID)
            var lastBalances = await _context.LnABalances
    .AsNoTracking()
    .GroupBy(b => b.LnAID)
    .Select(g => g.OrderByDescending(b => b.Year)
                  .ThenByDescending(b => b.Month)
                  .FirstOrDefault())
    .ToListAsync();

            // Step 2: Start with LnAs + Employees query
            var queryable = from s in _context.LnAs
                            join e in _context.Employees on s.EmpID equals e.EmpID
                            select new
                            {
                                s.LnAID,
                                s.EmpID,
                                s.LoanAmount,
                                s.MonthlyInstallment,
                                s.StartDate,
                                s.InterestRate,
                                s.Period,
                                s.Description,
                                s.IsApproved,
                                EmployeeName = e.FirstName + " " + e.LastName,
                                s.isPaused,
                                s.isForceClosed
                            };

            // 🔍 Global search
            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                var term = request.Query.ToLower();
                queryable = queryable.Where(s =>
                    (s.EmployeeName != null && s.EmployeeName.ToLower().Contains(term)) ||
                    (s.Description != null && s.Description.ToLower().Contains(term))
                );
            }

            // 🎯 Column-specific filters
            if (!string.IsNullOrWhiteSpace(request.EmployeeName))
                queryable = queryable.Where(s => s.EmployeeName.ToLower().Contains(request.EmployeeName.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.Description))
                queryable = queryable.Where(s => s.Description.ToLower().Contains(request.Description.ToLower()));

            if (request.IsApproved != null)
                queryable = queryable.Where(s => s.IsApproved == request.IsApproved);

            if (request.LoanAmountMin.HasValue)
                queryable = queryable.Where(s => s.LoanAmount >= request.LoanAmountMin.Value);

            if (request.LoanAmountMax.HasValue)
                queryable = queryable.Where(s => s.LoanAmount <= request.LoanAmountMax.Value);

            int totalCount = await queryable.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            // ↕ Sorting
            if (!string.IsNullOrWhiteSpace(request.SortField))
            {
                bool ascending = request.SortOrder?.ToLower() == "asc";
                queryable = ApplySorting(queryable, request.SortField, ascending);
            }
            else
            {
                queryable = queryable.OrderBy(s => s.LnAID);
            }

            // 📄 Paging
            var lnAs = await queryable
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            // Step 3: Join with balances (in-memory)
            var finalData = (from s in lnAs
                             join a in lastBalances on s.LnAID equals a.LnAID into balances
                             from a in balances.DefaultIfEmpty()
                             select new
                             {
                                 s.LnAID,
                                 s.EmpID,
                                 s.LoanAmount,
                                 s.MonthlyInstallment,
                                 s.StartDate,
                                 s.InterestRate,
                                 s.Period,
                                 s.Description,
                                 s.IsApproved,
                                 s.EmployeeName,
                                 s.isPaused,
                                 s.isForceClosed,
                                 ClosingBalance = a != null ? a.ClosingBalance : (double?)null
                             }).ToList();
            var response = new PaginatedResponse<object>
            {
                Data = finalData,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = totalPages
            };

            return Ok(response);
        }


        // GET: api/LnAs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LnA>> GetLnA(int id)
        {
            var lnA = await _context.LnAs.FindAsync(id);

            if (lnA == null)
            {
                return NotFound();
            }

            return lnA;
        }

        [HttpGet("ByEmployee")]
        public async Task<ActionResult<IEnumerable<object>>> GetLoansByEmployee(int empId)
        {
            var loans = await _context.LnAs
                .Where(s => s.EmpID == empId)
                .ToListAsync();

            if (loans == null || loans.Count == 0)
            {
                return NotFound("No loans found for the specified employee.");
            }

            var currentMonth = DateTime.Now.Month;
            var loanData = new List<object>();

            foreach (var loan in loans)
            {
                // Get pending balance
                var pendingBalance = await _context.LnABalances
                    .Where(b => b.EmpID == empId && b.LnAID == loan.LnAID && b.Month == currentMonth)
                    .Select(b => b.OpeningBalance)
                    .FirstOrDefaultAsync();

                // Fetch approver details (if available)
                string? approverName = null;
                if (loan.IsApprovedBy.HasValue)
                {
                    approverName = await _context.Employees
                        .Where(e => e.EmpID == loan.IsApprovedBy.Value)
                        .Select(e => e.FirstName + " " + (e.LastName ?? ""))
                        .FirstOrDefaultAsync();
                }

                loanData.Add(new
                {
                    LoanID = loan.LnAID,
                    LoanAmount = loan.LoanAmount,
                    StartDate = loan.StartDate,
                    PendingBalance = pendingBalance,
                    Description = loan.Description,
                    Installment = loan.MonthlyInstallment,
                    IsApproved = loan.IsApproved,
                    IsApprovedBy = loan.IsApprovedBy,
                    IsApprovedByName = approverName // <-- Concatenated Name
                });
            }

            return Ok(loanData);
        }


        // PUT: api/LnAs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /*[HttpPut("{id}")]
        public async Task<IActionResult> PutLnA(int id, LnA lnA)
        {
            if (id != lnA.LnAID)
            {
                return BadRequest();
            }

            _context.Entry(lnA).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LnAExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }*/

        [HttpPut("UpdateLoanAndBalances")]
        public async Task<IActionResult> UpdateLoanAndBalances([FromBody] LnAUpdate request)
        {
            if (request.LnAID <= 0 || !request.EffectiveDate.HasValue)
                return BadRequest("LnAID and EffectiveDate are required.");

            var lnA = await _context.LnAs.FindAsync(request.LnAID);
            if (lnA == null)
                return NotFound("Loan not found.");

            var oldLnAState = System.Text.Json.JsonSerializer.Serialize(lnA);

            // === STEP 1: Update Loan Amount or Installment if required ===
            if (request.isLoanAmountChanged == true && request.AdditionAmount.HasValue)
                lnA.LoanAmount = (lnA.LoanAmount ?? 0) + request.AdditionAmount.Value;

            if (request.isInstallmentChanged == true && request.NewMonthlyInstallment.HasValue)
                lnA.MonthlyInstallment = request.NewMonthlyInstallment.Value;

            await _context.SaveChangesAsync();

            // === STEP 2: Determine remaining balance before effective date ===
            int effMonth = request.EffectiveDate.Value.Month;
            int effYear = request.EffectiveDate.Value.Year;

            var totalRecoveredBeforeEffectiveDate = await _context.LnABalances
                .Where(b => b.LnAID == request.LnAID &&
                           (b.Year < effYear ||
                           (b.Year == effYear && b.Month < effMonth)))
                .SumAsync(b => (double?)(b.AmountRecovered ?? 0)) ?? 0;

            double totalLoanAmount = lnA.LoanAmount ?? 0;
            double remainingBalance = totalLoanAmount - totalRecoveredBeforeEffectiveDate;
            double newInstallment = lnA.MonthlyInstallment ?? 0;

            if (remainingBalance <= 0)
                return Ok("Loan already fully recovered before effective date.");

            // Recalculate remaining period (rounded up)
            int newPeriod = (int)Math.Ceiling(totalLoanAmount / newInstallment);
            lnA.Period = newPeriod;
            _context.Entry(lnA).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            // === STEP 3: Fetch balances from effective date onwards ===
            var balancesToUpdate = await _context.LnABalances
                .Where(b => b.LnAID == request.LnAID &&
                           (b.Year > effYear ||
                           (b.Year == effYear && b.Month >= effMonth)))
                .OrderBy(b => b.Year).ThenBy(b => b.Month)
                .ToListAsync();

            if (!balancesToUpdate.Any())
                return Ok("No balance entries found to update after effective date.");

            // === STEP 4: Update balances sequentially ===
            double runningOpening = remainingBalance;

            foreach (var bal in balancesToUpdate)
            {
                if (runningOpening <= 0) break;

                double emi = Math.Min(newInstallment, runningOpening);
                double closing = runningOpening - emi;

                bal.OpeningBalance = runningOpening;
                bal.AmountRecovered = emi;
                bal.ClosingBalance = closing;

                runningOpening = closing;
                _context.Entry(bal).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();

            lnA.UpdatedAt = request.EffectiveDate;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                // Now you have the user ID
                lnA.UpdatedBy = userId;
            }
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Loan & Advance",
                "Update Loan and Balances",
                $"Updated loan {lnA.LnAID} for employee {lnA.EmpID}. Effective: {effMonth:D2}/{effYear}",
                lnA.EmpID.ToString(),
                oldLnAState,
                System.Text.Json.JsonSerializer.Serialize(lnA)
            );

            /* // === STEP 5: Update new period ===
             int remainingMonths = balancesToUpdate.Count(b => (b.ClosingBalance ?? 0) > 0);
             lnA.Period = remainingMonths > 0 ? remainingMonths : lnA.Period;
             _context.Entry(lnA).State = EntityState.Modified;

             await _context.SaveChangesAsync();*/

            return Ok(new
            {
                Message = "Loan and balances updated successfully (only existing rows).",
                UpdatedLoanAmount = lnA.LoanAmount,
                NewInstallment = lnA.MonthlyInstallment,
                UpdatedTill = $"{effMonth:D2}/{effYear}",
                RemainingBalance = runningOpening
            });
        }




        /*[HttpPut("ApproveLoan/{id}/{empID}")]
        public async Task<IActionResult> ApproveLoan(int id, int empID)
        {
            var lnA = await _context.LnAs.FindAsync(id);
            if (lnA == null)
                return NotFound("Loan not found.");

            // Approve loan / arrear
            lnA.IsApproved = true;
            lnA.IsApprovedBy = empID;
            _context.Entry(lnA).State = EntityState.Modified;

            // === Handle arrear case ===
            if (lnA.IsArrearOrAdvance != null && lnA.IsArrearOrAdvance == true)
            {
                // Just add a single balance entry (like lump-sum arrear credit)
                var balanceEntry = new LnABalance
                {
                    LnAID = lnA.LnAID,
                    EmpID = lnA.EmpID,
                    Month = DateTime.Now.Month,
                    Year = DateTime.Now.Year,
                    OpeningBalance = 0,
                    AmountRecovered = 0,
                    ClosingBalance = lnA.LoanAmount ?? 0
                };

                await _context.LnABalances.AddAsync(balanceEntry);
            }
            else
            {
                // === Regular loan schedule logic ===
                if (lnA.LoanAmount == null || lnA.Period == null || lnA.StartDate == null)
                    return BadRequest("Loan details are incomplete (Amount, Period, StartDate required).");

                double loanAmount = lnA.LoanAmount.Value;
                int totalMonths = lnA.Period.Value;
                double monthlyInstallment = lnA.MonthlyInstallment ?? (loanAmount / totalMonths);

                DateTime startDate = lnA.StartDate.Value;
                DateTime currentMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

                double outstandingBalance = loanAmount;
                DateTime emiDate = new DateTime(startDate.Year, startDate.Month, 1);
                int monthCounter = 1;

                while (emiDate <= currentMonth && outstandingBalance > 0 && monthCounter <= totalMonths)
                {
                    double installment = Math.Min(monthlyInstallment, outstandingBalance);

                    var balanceEntry = new LnABalance
                    {
                        LnAID = lnA.LnAID,
                        EmpID = lnA.EmpID,
                        Month = emiDate.Month,
                        Year = emiDate.Year,
                        OpeningBalance = outstandingBalance,
                        AmountRecovered = installment,
                        ClosingBalance = outstandingBalance - installment
                    };

                    await _context.LnABalances.AddAsync(balanceEntry);

                    outstandingBalance -= installment;
                    emiDate = emiDate.AddMonths(1);
                    monthCounter++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = lnA.Period == 0 && lnA.MonthlyInstallment == 0
                    ? "Arrear approved successfully."
                    : "Loan approved successfully with balances created.",
                LoanId = lnA.LnAID,
                EmployeeId = lnA.EmpID
            });
        }*/

        [HttpPut("ApproveLoan/{id}/{empID}")]
        public async Task<IActionResult> ApproveLoan(int id, int empID)
        {
            var lnA = await _context.LnAs.FindAsync(id);
            if (lnA == null)
                return NotFound("Loan not found.");

            var oldLnAState = System.Text.Json.JsonSerializer.Serialize(lnA);

            // Approve loan / arrear
            lnA.IsApproved = true;
            lnA.IsApprovedBy = empID;
            _context.Entry(lnA).State = EntityState.Modified;

            // === Handle arrear case ===
            if (lnA.IsArrearOrAdvance != null && lnA.IsArrearOrAdvance == true)
            {
                // Lump-sum arrear credit
                var balanceEntry = new LnABalance
                {
                    LnAID = lnA.LnAID,
                    EmpID = lnA.EmpID,
                    Month = DateTime.Now.Month,
                    Year = DateTime.Now.Year,
                    OpeningBalance = 0,
                    AmountRecovered = 0,
                    ClosingBalance = lnA.LoanAmount ?? 0
                };

                await _context.LnABalances.AddAsync(balanceEntry);
            }
            else
            {
                // === Regular loan schedule logic ===
                if (lnA.LoanAmount == null || lnA.Period == null || lnA.StartDate == null)
                    return BadRequest("Loan details are incomplete (Amount, Period, StartDate required).");

                double loanAmount = lnA.LoanAmount.Value;
                int totalMonths = lnA.Period.Value;
                double monthlyInstallment = lnA.MonthlyInstallment ?? (loanAmount / totalMonths);

                DateTime startDate = lnA.StartDate.Value;
                DateTime firstInstallmentDate = new DateTime(startDate.Year, startDate.Month, 1).AddMonths(1); // 👈 Start from next month

                double outstandingBalance = loanAmount;
                int monthCounter = 1;

                // Loop starting *after* loan creation month
                while (monthCounter <= totalMonths && outstandingBalance > 0)
                {
                    double installment = Math.Min(monthlyInstallment, outstandingBalance);

                    var balanceEntry = new LnABalance
                    {
                        LnAID = lnA.LnAID,
                        EmpID = lnA.EmpID,
                        Month = firstInstallmentDate.Month,
                        Year = firstInstallmentDate.Year,
                        OpeningBalance = outstandingBalance,
                        AmountRecovered = installment,
                        ClosingBalance = outstandingBalance - installment
                    };

                    await _context.LnABalances.AddAsync(balanceEntry);

                    outstandingBalance -= installment;
                    firstInstallmentDate = firstInstallmentDate.AddMonths(1);
                    monthCounter++;
                }
            }

            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Loan & Advance",
                "Approve Loan",
                $"Approved loan {id} for employee {lnA.EmpID}",
                lnA.EmpID.ToString(),
                oldLnAState,
                System.Text.Json.JsonSerializer.Serialize(lnA)
            );

            return Ok(new
            {
                Message = lnA.IsArrearOrAdvance == true
                    ? "Arrear approved successfully."
                    : "Loan approved successfully with balance schedule created starting from next month.",
                LoanId = lnA.LnAID,
                EmployeeId = lnA.EmpID
            });
        }


        [HttpPut("ForceCloseLoan/{id}")]
        public async Task<IActionResult> ForceCloseLoan(int id)
        {
            var lnA = await _context.LnAs.FindAsync(id);
            if (lnA == null)
                return NotFound("Loan not found.");

            var oldLnAState = System.Text.Json.JsonSerializer.Serialize(lnA);

            // ✅ Mark loan as force closed
            lnA.isForceClosed = true;
            _context.Entry(lnA).State = EntityState.Modified;

            // ✅ Get latest balance entry for this loan (most recent month & year)
            var latestBalance = await _context.LnABalances
                .Where(b => b.LnAID == id)
                .OrderByDescending(b => b.Year)
                .ThenByDescending(b => b.Month)
                .FirstOrDefaultAsync();

            int currentMonth = DateTime.Now.Month;
            int currentYear = DateTime.Now.Year;

            if (latestBalance != null)
            {
                // ✅ If the latest record is for a past month, create a new entry for current month
                if (latestBalance.Month != currentMonth || latestBalance.Year != currentYear)
                {
                    var newBalance = new LnABalance
                    {
                        LnAID = latestBalance.LnAID,
                        EmpID = latestBalance.EmpID,
                        Month = currentMonth,
                        Year = currentYear,
                        OpeningBalance = latestBalance.ClosingBalance ?? 0,
                        ClosingBalance = 0,
                        AmountRecovered = latestBalance.ClosingBalance ?? 0
                    };
                    _context.LnABalances.Add(newBalance);
                }
                else
                {
                    // ✅ If it's already current month, just update it
                    latestBalance.ClosingBalance = 0;
                    latestBalance.AmountRecovered = latestBalance.OpeningBalance ?? 0;
                    _context.Entry(latestBalance).State = EntityState.Modified;
                }
            }
            else
            {
                // ✅ If no balance exists yet, create one directly with zero closing balance
                var newBalance = new LnABalance
                {
                    LnAID = lnA.LnAID,
                    EmpID = lnA.EmpID,
                    Month = currentMonth,
                    Year = currentYear,
                    OpeningBalance = (double?)lnA.LoanAmount ?? 0,
                    ClosingBalance = 0,
                    AmountRecovered = (double?)lnA.LoanAmount ?? 0
                };
                _context.LnABalances.Add(newBalance);
            }

            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Loan & Advance",
                "Force Close Loan",
                $"Force closed loan {id} for employee {lnA.EmpID}",
                lnA.EmpID.ToString(),
                oldLnAState,
                System.Text.Json.JsonSerializer.Serialize(lnA)
            );

            return Ok(new
            {
                Message = "Loan force-closed successfully. Latest balance updated to 0.",
                LoanId = lnA.LnAID,
                EmployeeId = lnA.EmpID,
                Month = currentMonth,
                Year = currentYear
            });
        }



        [HttpPut("PauseLoan/{id}")]
        public async Task<IActionResult> PauseLoan(int id, bool pause)
        {
            var lnA = await _context.LnAs.FindAsync(id);
            if (lnA == null)
                return NotFound("Loan not found.");

            var oldLnAState = System.Text.Json.JsonSerializer.Serialize(lnA);

            lnA.isPaused = pause; // set true or false based on input
            _context.Entry(lnA).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Loan & Advance",
                pause ? "Pause Loan" : "Resume Loan",
                $"{(pause ? "Paused" : "Resumed")} loan {id} for employee {lnA.EmpID}",
                lnA.EmpID.ToString(),
                oldLnAState,
                System.Text.Json.JsonSerializer.Serialize(lnA)
            );

            return Ok(new
            {
                Message = pause ? "Loan paused successfully." : "Loan resumed successfully.",
                LoanId = lnA.LnAID,
                EmployeeId = lnA.EmpID,
                IsPaused = lnA.isPaused
            });
        }


        [HttpPut("RejectLoan/{id}/{empID}")]
        public async Task<IActionResult> RejectLoan(int id, int empID, string reason)
        {
            var lnA = await _context.LnAs.FindAsync(id);
            if (lnA == null)
            {
                return NotFound();
            }

            var oldLnAState = System.Text.Json.JsonSerializer.Serialize(lnA);

            lnA.IsApproved = false;
            lnA.IsApprovedBy = empID; // Set the ID of the user who rejected the loan
            _context.Entry(lnA).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Loan & Advance",
                    "Reject Loan",
                    $"Rejected loan {id} for employee {lnA.EmpID}. Reason: {reason}",
                    lnA.EmpID.ToString(),
                    oldLnAState,
                    System.Text.Json.JsonSerializer.Serialize(lnA)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LnAExists(id))
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

        // POST: api/LnAs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<LnA>> PostLnA(LnA lnA)
        {
            if (lnA.Period == 0 && lnA.MonthlyInstallment == 0)
                lnA.IsArrearOrAdvance = true;

            if (lnA.isPaused == null)
                lnA.isPaused = false;
            if (lnA.isForceClosed == null)
                lnA.isForceClosed = false;

            _context.LnAs.Add(lnA);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Loan & Advance",
                "Create Loan",
                $"Created {(lnA.IsArrearOrAdvance == true ? "Arrear" : "Loan")} request for employee {lnA.EmpID}. Amount: {lnA.LoanAmount}",
                lnA.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(lnA)
            );

            return CreatedAtAction("GetLnA", new { id = lnA.LnAID }, lnA);
        }


        // DELETE: api/LnAs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLnA(int id)
        {
            var lnA = await _context.LnAs.FindAsync(id);
            if (lnA == null)
            {
                return NotFound();
            }

            _context.LnAs.Remove(lnA);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Loan & Advance",
                "Delete Loan",
                $"Deleted loan {id} for employee {lnA.EmpID}",
                lnA.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(lnA),
                null
            );

            return NoContent();
        }
        //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        //Reporting Section

        [HttpGet("GetAllLoansReport")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllLoansReport(
     [FromQuery] bool? isActive = null,
     [FromQuery] bool? isForceClosed = null,
     [FromQuery] bool? isPaused = null,
     [FromQuery] bool? isApproved = null,
     [FromQuery] string searchTerm = null)
        {
            var query = from s in _context.LnAs
                        join e in _context.Employees on s.EmpID equals e.EmpID
                        join b in _context.LnABalances on s.LnAID equals b.LnAID into balances
                        select new
                        {
                            s.LnAID,
                            s.EmpID,
                            EmployeeName = e.FirstName + " " + e.LastName,
                            s.LoanAmount,
                            s.MonthlyInstallment,
                            s.StartDate,
                            s.IsArrearOrAdvance,
                            s.InterestRate,
                            s.Period,
                            s.Description,
                            s.IsApproved,
                            s.isPaused,
                            s.isForceClosed,
                            balances
                        };

            if (isActive.HasValue)
            {
                if (isActive.Value)
                {
                    query = query.Where(s => (s.isForceClosed ?? false) == false &&
                                             (s.isPaused ?? false) == false &&
                                             s.balances.Any());
                }
                else
                {
                    query = query.Where(s => (s.isForceClosed ?? false) == true ||
                                             (s.isPaused ?? false) == true ||
                                             !s.balances.Any());
                }
            }

            if (isForceClosed.HasValue)
            {
                query = query.Where(s => (s.isForceClosed ?? false) == isForceClosed.Value);
            }

            if (isPaused.HasValue)
            {
                query = query.Where(s => (s.isPaused ?? false) == isPaused.Value);
            }

            if (isApproved.HasValue)
            {
                query = query.Where(s => (s.IsApproved ?? false) == isApproved.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(s =>
                    (s.EmployeeName != null && s.EmployeeName.ToLower().Contains(term)) ||
                    (s.Description != null && s.Description.ToLower().Contains(term)));
            }

            var loansReport = await query.ToListAsync();

            return Ok(loansReport);
        }
        [HttpGet("GetAllBalances/{month}/{year}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllBalances(int month, int year)
        {
            var balances = await (from b in _context.LnABalances
                                  join l in _context.LnAs on b.LnAID equals l.LnAID
                                  join e in _context.Employees on l.EmpID equals e.EmpID
                                  where b.Month == month && b.Year == year
                                  select new
                                  {
                                      b.LnABalanceID,
                                      b.LnAID,
                                      l.EmpID,
                                      EmployeeName = e.FirstName + " " + e.LastName,
                                      l.LoanAmount,
                                      l.MonthlyInstallment,
                                      l.InterestRate,
                                      l.Period,
                                      l.StartDate,
                                      l.IsArrearOrAdvance,
                                      l.Description,
                                      l.IsApproved,
                                      l.isPaused,
                                      l.isForceClosed,
                                      b.Month,
                                      b.Year,
                                      b.AmountRecovered,
                                      b.ClosingBalance,
                                      b.OpeningBalance
                                  })
                                  .ToListAsync();

            return Ok(balances);
        }




        private bool LnAExists(int id)
        {
            return _context.LnAs.Any(e => e.LnAID == id);
        }

        private IQueryable<T> ApplySorting<T>(IQueryable<T> query, string sortField, bool ascending)
        {
            if (string.IsNullOrWhiteSpace(sortField))
                return query;

            var parameter = Expression.Parameter(typeof(T), "x");
            var property = Expression.PropertyOrField(parameter, sortField);
            var keySelector = Expression.Lambda(property, parameter);

            string methodName = ascending ? "OrderBy" : "OrderByDescending";

            var methodCallExpression = Expression.Call(
                typeof(Queryable),
                methodName,
                new Type[] { typeof(T), property.Type },
                query.Expression,
                Expression.Quote(keySelector));

            return query.Provider.CreateQuery<T>(methodCallExpression);
        }
    }

    public class LnASearchRequest
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string? Query { get; set; }          // Global search
        public string? EmployeeName { get; set; }   // Filter
        public string? Description { get; set; }    // Filter
        public bool? IsApproved { get; set; }
        public double? LoanAmountMin { get; set; }
        public double? LoanAmountMax { get; set; }

        public string? SortField { get; set; }      // e.g. "LoanAmount"
        public string? SortOrder { get; set; }      // "asc" or "desc"
    }
}
