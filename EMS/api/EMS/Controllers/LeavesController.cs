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
using System.Security.Claims;
using ClosedXML.Excel;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeavesController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public LeavesController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Leaves
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Leave>>> GetLeaves()
        {
            return await _context.Leaves.ToListAsync();
        }

        // GET: api/Leaves/5
        /*[HttpGet("{id}")]
        public async Task<ActionResult<Leave>> GetLeave(int id)
        {
            var leave = await _context.Leaves.FindAsync(id);

            if (leave == null)
            {
                return NotFound();
            }

            return leave;
        }*/

        // PUT: api/Leaves/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLeave(int id, Leave leave)
        {
            if (id != leave.LeaveID)
            {
                return BadRequest();
            }

            var oldLeave = await _context.Leaves.AsNoTracking().FirstOrDefaultAsync(l => l.LeaveID == id);
            if (oldLeave == null) return NotFound();

            _context.Entry(leave).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Leave Management",
                    "Update Leave",
                    $"Updated leave request for employee {leave.EmpID}",
                    leave.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldLeave),
                    System.Text.Json.JsonSerializer.Serialize(leave)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveExists(id))
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

        [HttpPut("Approved/{id}/{approvedbyID}")]
        public async Task<IActionResult> ApproveLeave(int id, int approvedbyID, [FromBody] string rejectionReason = null)
        {
            var leave = await _context.Leaves.FindAsync(id);
            if (leave == null)
                return NotFound();

            var oldLeaveState = System.Text.Json.JsonSerializer.Serialize(leave);

            // Mark as approved
            leave.IsApproved = true;
            leave.ApprovedbyEmpID = approvedbyID;
            leave.RejectionReason = rejectionReason;
            _context.Entry(leave).State = EntityState.Modified;

            // --- Leave balance adjustment ---
            var leaveMaster = await _context.LeaveMasters
                .FirstOrDefaultAsync(lm => lm.LeaveType == leave.LeaveType);
            if (leaveMaster == null)
                return BadRequest("Invalid leave type");

            int year = leave.StartDate?.Year ?? DateTime.Now.Year;

            //Lazy initialization (with carry forward if needed)
            var leaveBalance = await GetOrCreateLeaveBalance(leave.EmpID, leaveMaster.LeaveMasterID, year);

            // Calculate leave days
            int leaveDays;
            if (leave.StartDate != null && leave.EndDate != null)
                leaveDays = (leave.EndDate.Value.Date - leave.StartDate.Value.Date).Days + 1;
            else
                leaveDays = 1;

            // Check balance
            if (leaveBalance.ClosingBalance < leaveDays)
                return BadRequest("Insufficient leave balance");

            // Deduct balance
            leaveBalance.Availed += leaveDays;
            leaveBalance.ClosingBalance -= leaveDays;

            _context.LeaveBalances.Update(leaveBalance);

            // Add LeaveTransaction
            for (int i = 0; i < leaveDays; i++)
            {
                var leaveDate = (leave.StartDate ?? leave.EndDate.Value).Date.AddDays(i);
                _context.LeaveTransactions.Add(new LeaveTransaction
                {
                    EmpID = leave.EmpID,
                    LeaveMasterID = leaveMaster.LeaveMasterID,
                    LeaveDate = leaveDate,
                    TransactionType = "Debit",
                    Days = 1
                });
            }

            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Leave Management",
                "Approve Leave",
                $"Approved leave request {id} for employee {leave.EmpID}",
                leave.EmpID.ToString(),
                oldLeaveState,
                System.Text.Json.JsonSerializer.Serialize(leave)
            );

            return NoContent();
        }


        private async Task<LeaveBalance> GetOrCreateLeaveBalance(int empId, int leaveMasterId, int year)
        {
            // Check if already exists
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmpID == empId && lb.LeaveMasterID == leaveMasterId && lb.Year == year);

            if (balance != null)
                return balance;

            // Get leave master info
            var leaveMaster = await _context.LeaveMasters.FindAsync(leaveMasterId);
            if (leaveMaster == null)
                throw new Exception("Invalid LeaveMaster");

            // Get last year's balance
            var prevBalance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmpID == empId && lb.LeaveMasterID == leaveMasterId && lb.Year == year - 1);

            int carryForward = 0;
            if (prevBalance != null && leaveMaster.IsCarryForward)
                carryForward = Math.Min(prevBalance.ClosingBalance, leaveMaster.MaxCarryForward);

            // Create new balance
            balance = new LeaveBalance
            {
                EmpID = empId,
                LeaveMasterID = leaveMasterId,
                Year = year,
                OpeningBalance = leaveMaster.AnnualQuota + carryForward,
                Availed = 0,
                Adjusted = 0,
                ClosingBalance = leaveMaster.AnnualQuota + carryForward
            };

            _context.LeaveBalances.Add(balance);
            await _context.SaveChangesAsync();

            return balance;
        }


        [HttpPut("Reject/{id}/{approvedbyID}")]
        public async Task<IActionResult> RejectLeave(int id, int approvedbyID, [FromBody] string rejectionReason)
        {
            var leave = await _context.Leaves.FindAsync(id);
            if (leave == null)
            {
                return NotFound();
            }

            var oldLeaveState = System.Text.Json.JsonSerializer.Serialize(leave);

            leave.IsApproved = false;
            leave.ApprovedbyEmpID = approvedbyID;
            leave.RejectionReason = rejectionReason;

            _context.Entry(leave).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Leave Management",
                    "Reject Leave",
                    $"Rejected leave request {id} for employee {leave.EmpID}. Reason: {rejectionReason}",
                    leave.EmpID.ToString(),
                    oldLeaveState,
                    System.Text.Json.JsonSerializer.Serialize(leave)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveExists(id))
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

        [HttpGet("LeaveBalance/{empId}/{year}")]
        public async Task<ActionResult<IEnumerable<object>>> GetLeaveBalance(int empId, int year)
        {
            // Fetch existing leave balances for the year
            var balances = await (from lb in _context.LeaveBalances
                                  join lm in _context.LeaveMasters on lb.LeaveMasterID equals lm.LeaveMasterID
                                  where lb.EmpID == empId && lb.Year == year
                                  select new
                                  {
                                      lm.LeaveType,
                                      lm.AnnualQuota,
                                      lb.OpeningBalance,
                                      lb.Availed,
                                      lb.Adjusted,
                                      lb.ClosingBalance,
                                      lm.IsEncashable,
                                      lm.IsCarryForward,
                                      lm.MaxCarryForward
                                  }).ToListAsync();

            if (balances == null || balances.Count == 0)
            {
                var leaveMasters = await _context.LeaveMasters.ToListAsync();
                var prevYearBalances = await _context.LeaveBalances
                    .Where(lb => lb.EmpID == empId && lb.Year == year - 1)
                    .ToListAsync();

                foreach (var lm in leaveMasters)
                {
                    int openingBalance = lm.AnnualQuota;

                    // Check if carry forward is allowed
                    if (lm.IsCarryForward)
                    {
                        var prevBalance = prevYearBalances
                            .FirstOrDefault(pb => pb.LeaveMasterID == lm.LeaveMasterID);

                        if (prevBalance != null)
                        {
                            // Carry forward up to MaxCarryForward
                            int carryForward = Math.Min(prevBalance.ClosingBalance, lm.MaxCarryForward);
                            openingBalance = carryForward + lm.AnnualQuota;
                        }
                    }

                    var newBalance = new LeaveBalance
                    {
                        EmpID = empId,
                        LeaveMasterID = lm.LeaveMasterID,
                        Year = year,
                        OpeningBalance = openingBalance,
                        Availed = 0,
                        Adjusted = 0,
                        ClosingBalance = openingBalance
                    };

                    _context.LeaveBalances.Add(newBalance);
                }

                await _context.SaveChangesAsync();

                // Re-fetch to return with full details
                balances = await (from lb in _context.LeaveBalances
                                  join lm in _context.LeaveMasters on lb.LeaveMasterID equals lm.LeaveMasterID
                                  where lb.EmpID == empId && lb.Year == year
                                  select new
                                  {
                                      lm.LeaveType,
                                      lm.AnnualQuota,
                                      lb.OpeningBalance,
                                      lb.Availed,
                                      lb.Adjusted,
                                      lb.ClosingBalance,
                                      lm.IsEncashable,
                                      lm.IsCarryForward,
                                      lm.MaxCarryForward
                                  }).ToListAsync();
            }

            return Ok(balances);
        }





        [HttpGet("GetLeavesbyEmpID/{id}")]
        public async Task<ActionResult<IEnumerable<object>>> GetLeavesByEmpID(int id)
        {
            var leaves = await _context.Leaves
                .Where(l => l.EmpID == id)
                // First join: Leave.EmpID → Employee (the one who applied)
                .Join(_context.Employees,
                      leave => leave.EmpID,
                      emp => emp.EmpID,
                      (leave, emp) => new
                      {
                          leave,
                          EmployeeName = $"{emp.FirstName} {emp.LastName}"
                      })
                // Left join: Leave.ApprovedbyEmpID → Employee (the approver)
                .GroupJoin(
                      _context.Employees,
                      temp => temp.leave.ApprovedbyEmpID,
                      approver => approver.EmpID,
                      (temp, approvers) => new { temp, approvers })
                .SelectMany(
                      x => x.approvers.DefaultIfEmpty(), // ensures we still get results when approver is null
                      (x, approver) => new
                      {
                          x.temp.leave.LeaveID,
                          x.temp.leave.EmpID,
                          x.temp.EmployeeName,
                          ApproverName = approver != null ? $"{approver.FirstName} {approver.LastName}" : null,
                          x.temp.leave.StartDate,
                          x.temp.leave.EndDate,
                          x.temp.leave.LeaveType,
                          x.temp.leave.LeaveReason,
                          x.temp.leave.IsApproved,
                          x.temp.leave.ApprovedbyEmpID,
                          x.temp.leave.CreatedAt
                      })
                .ToListAsync();

            if (!leaves.Any())
            {
                return NotFound("No leaves found for this employee");
            }

            return Ok(leaves);
        }

        /*[HttpGet("GetLeavestobeApproved/{id}")]
        public async Task<ActionResult<IEnumerable<Leave>>> GetLeavesToBeApproved(int id)
        {
           

            // Step 1: Get the PositionID of the logged-in user
            var userPositionId = await _context.EmpDeptPositions
                .Where(e => e.EmpID == id)
                .Select(e => e.PositionID)
                .FirstOrDefaultAsync();

            if (userPositionId == 0)
            {
                return NotFound("No position found for the logged-in employee");
            }

            // Step 2: Find all positions that report to the logged-in user's position
            var reportingPositionIds = (await _context.Positions
        .Where(p => p.ReportsTo != null)
        .ToListAsync()) // Load to memory
    .Where(p => p.ReportsTo.Contains(userPositionId)) // LINQ to Objects
    .Select(p => p.PositionID)
    .ToList();

            foreach (var positionId in reportingPositionIds)
            {
                // Ensure the position exists
                Console.WriteLine($"PositionID: {positionId} exists in the database.");
            }

            if (!reportingPositionIds.Any())
            {
                return NotFound("No subordinate positions found for this user");
            }

            // Step 3: Get all EmpIDs that have these reporting positions
            var subordinateEmpIds = await _context.EmpDeptPositions
                .Where(e => reportingPositionIds.Contains(e.PositionID))
                .Select(e => e.EmpID)
                .ToListAsync();

            foreach (var empId in subordinateEmpIds)
            {

                // Ensure the employee exists
                Console.WriteLine($"EmpID: {empId} exists in the database.");
            }

            if (!subordinateEmpIds.Any())
            {
                return NotFound("No employees found under this user's supervision");
            }

            // Step 4: Fetch leaves for those employees where IsApproved is NULL
            var leaves = await _context.Leaves
    .Where(l => subordinateEmpIds.Contains(l.EmpID) && l.IsApproved == null)
    .Join(_context.Employees,
          leave => leave.EmpID,
          emp => emp.EmpID,
          (leave, emp) => new
          {
              leave.LeaveID,
              leave.EmpID,
              EmployeeName = $"{emp.FirstName} {emp.LastName}", // assuming column name is EmpName
              leave.StartDate,
              leave.EndDate,
              leave.LeaveType,
              leave.LeaveReason,
              leave.IsApproved,
              leave.CreatedAt
          })
    .ToListAsync();

            if (!leaves.Any())
            {
                return NotFound("No leaves to approve");
            }

            return Ok(leaves);
        }*/

        [HttpGet("GetLeavestobeApproved/{id}")]
        public async Task<ActionResult<IEnumerable<Leave>>> GetLeavesToBeApproved(int id)
        {
            // Step 1: Ensure the manager exists
            var managerExists = await _context.Employees.AnyAsync(e => e.EmpID == id);
            if (!managerExists)
            {
                return NotFound("No employee found for the given ID");
            }

            // Step 2: Find all employees who report (directly or among multiple) to this manager
            var reportingEmployees = (await _context.Employees
                .Where(e => e.ReportsTo != null)
                .ToListAsync()) // Load to memory since ReportsTo is a list (cannot be directly translated to SQL)
                .Where(e => e.ReportsTo.Contains(id)) // LINQ to Objects
                .Select(e => e.EmpID)
                .ToList();

            foreach (var empId in reportingEmployees)
            {
                Console.WriteLine($"EmpID: {empId} reports to {id}");
            }

            if (!reportingEmployees.Any())
            {
                return NotFound("No employees found under this user's supervision");
            }

            // Step 3: Fetch leaves for those employees where IsApproved is NULL
            var leaves = await _context.Leaves
                .Where(l => reportingEmployees.Contains(l.EmpID) && l.IsApproved == null)
                .Join(_context.Employees,
                      leave => leave.EmpID,
                      emp => emp.EmpID,
                      (leave, emp) => new
                      {
                          leave.LeaveID,
                          leave.EmpID,
                          EmployeeName = $"{emp.FirstName} {emp.LastName}",
                          leave.StartDate,
                          leave.EndDate,
                          leave.LeaveType,
                          leave.LeaveReason,
                          leave.IsApproved,
                          leave.CreatedAt
                      })
                .ToListAsync();

            if (!leaves.Any())
            {
                return NotFound("No leaves to approve");
            }

            return Ok(leaves);
        }

        [HttpGet("GetLeavesofEmployeesunderEmpID/{empID}")]
        public async Task<ActionResult<IEnumerable<Leave>>> GetLeavesofEmployeesunderEmpID(int empID)
        {
            // 1️⃣ Get all employees reporting to this manager in memory
            var employees = await _context.Employees
                .Where(e => e.ReportsTo != null)
                .ToListAsync();

            var employeeIDs = employees
                .Where(e => e.ReportsTo.Contains(empID))
                .Select(e => e.EmpID)
                .ToList();

            //Get all leaves for those employees
            var leaves = await (from l in _context.Leaves
                                join e in _context.Employees on l.EmpID equals e.EmpID
                                where employeeIDs.Contains(l.EmpID)
                                select new
                                {
                                    l.LeaveID,
                                    l.EmpID,
                                    EmployeeName = e.FirstName + " " +e.LastName,
                                    l.LeaveType,
                                    l.StartDate,
                                    l.EndDate,
                                    l.LeaveReason,
                                    l.IsApproved
                                }).ToListAsync();

            if (leaves == null || leaves.Count == 0)
                return NotFound();

            return Ok(leaves);
        }






        // POST: api/Leaves
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Leave>> PostLeave([FromForm] LeaveRequest request)
        {
            var leave = new Leave
            {
                LeaveID = request.LeaveID,
                EmpID = request.EmpID,
                LeaveType = request.LeaveType,
                LeaveReason = request.LeaveReason,
                IsApproved = request.IsApproved,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedAt = request.CreatedAt,
                OnDutyHours = request.OnDutyHours,
                ApprovedbyEmpID = request.ApprovedbyEmpID,
                Attachment = null
            };

            if (request.File != null && request.File.Length > 0)
            {
                try
                {
                    var uploadsFolder = Path.Combine("wwwroot", "uploads", "leaves");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var fileName = $"{leave.EmpID}_{DateTime.Now.Ticks}_{request.File.FileName}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.File.CopyToAsync(stream);
                    }

                    leave.Attachment = Path.Combine("uploads", "leaves", fileName).Replace("\\", "/");
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = "Error uploading file: " + ex.Message });
                }
            }

            _context.Leaves.Add(leave);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Leave Management",
                "Apply Leave",
                $"Employee {leave.EmpID} applied for {leave.LeaveType} leave from {leave.StartDate:yyyy-MM-dd} to {leave.EndDate:yyyy-MM-dd}",
                leave.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(leave)
            );

            return Ok(leave);
        }

        // DELETE: api/Leaves/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLeave(int id)
        {
            var leave = await _context.Leaves.FindAsync(id);
            if (leave == null)
            {
                return NotFound();
            }

            _context.Leaves.Remove(leave);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Leave Management",
                "Delete Leave",
                $"Deleted leave request {id} for employee {leave.EmpID}",
                leave.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(leave),
                null
            );

            return NoContent();
        }

        // GET: api/Leaves/AvailableReportFields
        [HttpGet("AvailableReportFields")]
        public IActionResult GetAvailableLeaveReportFields()
        {
            try
            {
                var availableFields = new
                {
                    Employee = new List<dynamic>
                    {
                        new { Key = "EmpID", Label = "Employee ID" },
                        new { Key = "EmployeeName", Label = "Employee Name" },
                        new { Key = "EmployeeCode", Label = "Employee Code" },
                        new { Key = "Department", Label = "Department" },
                        new { Key = "Designation", Label = "Designation" },
                        new { Key = "WorkEmail", Label = "Work Email" },
                    },
                    Leave = new List<dynamic>
                    {
                        new { Key = "LeaveID", Label = "Leave ID" },
                        new { Key = "LeaveType", Label = "Leave Type" },
                        new { Key = "LeaveReason", Label = "Leave Reason" },
                        new { Key = "StartDate", Label = "Start Date" },
                        new { Key = "EndDate", Label = "End Date" },
                        new { Key = "LeaveDays", Label = "Leave Days" },
                        new { Key = "CreatedAt", Label = "Applied Date" },
                        new { Key = "IsApproved", Label = "Status" },
                        new { Key = "ApproverName", Label = "Approver Name" },
                        new { Key = "RejectionReason", Label = "Rejection Reason" },
                        new { Key = "OnDutyHours", Label = "On Duty Hours" },
                    },
                    LeaveBalance = new List<dynamic>
                    {
                        new { Key = "Year", Label = "Year" },
                        new { Key = "OpeningBalance", Label = "Opening Balance" },
                        new { Key = "Availed", Label = "Availed" },
                        new { Key = "Adjusted", Label = "Adjusted" },
                        new { Key = "ClosingBalance", Label = "Closing Balance" },
                    },
                    LeaveTransaction = new List<dynamic>
                    {
                        new { Key = "LeaveTransactionID", Label = "Transaction ID" },
                        new { Key = "LeaveDate", Label = "Leave Date" },
                        new { Key = "TransactionType", Label = "Transaction Type" },
                        new { Key = "Days", Label = "Days" },
                        new { Key = "CreatedAt", Label = "Created Date" },
                    },
                };
                return Ok(availableFields);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("GetDistinctReasons")]
        public async Task<IActionResult> GetDistinctLeaveReasons()
        {
            try
            {
                var reasons = await _context.Leaves
                    .Where(l => !string.IsNullOrEmpty(l.LeaveReason))
                    .Select(l => l.LeaveReason)
                    .Distinct()
                    .ToListAsync();
                return Ok(reasons);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST: api/Leaves/GenerateReport
        [HttpPost("GenerateReport")]
        public async Task<IActionResult> GenerateLeaveReport([FromBody] LeaveReportRequest request)
        {
            try
            {
                var reportService = new LeaveReportService(_context);
                var data = await reportService.GenerateLeaveReport(
                    request.Fields,
                    request.Status,
                    request.LeaveType,
                    request.StartDate,
                    request.EndDate,
                    request.Department,
                    request.EmpId
                );

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("GenerateLeaveRegisterReport")]
        public async Task<IActionResult> GenerateLeaveRegisterReport([FromBody] LeaveRegisterReportRequest request)
        {
            try
            {
                var reportService = new LeaveReportService(_context);
                var data = await reportService.GenerateLeaveRegisterReport(request.ViewType);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<Leave>>> GetLeavesByEmployeeId(int id)
        {
            var leaves = await _context.Leaves
                .Where(l => l.EmpID == id)
                .ToListAsync();
            if (leaves == null || leaves.Count == 0)
            {
                return NotFound();
            }
            return Ok(leaves);
        }

        [HttpGet("GetReasons")]
        public async Task<ActionResult<List<string>>> GetReasons()
        {
            var reasons = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            try
            {
                var rootPath = Directory.GetCurrentDirectory();
                var excelPath = Path.Combine(rootPath, "Reasons.xlsx");
                if (System.IO.File.Exists(excelPath))
                {
                    using (var workbook = new ClosedXML.Excel.XLWorkbook(excelPath))
                    {
                        var worksheet = workbook.Worksheets.FirstOrDefault();
                        if (worksheet != null)
                        {
                            // RangeUsed() returns an IXLRange, and RowsUsed() returns IEnumerable<IXLRangeRow>
                            var rangeRows = worksheet.RangeUsed()?.RowsUsed();

                            // Safely enumerate even if null
                            var rows = rangeRows != null ? rangeRows : Enumerable.Empty<ClosedXML.Excel.IXLRangeRow>();

                            // Skip the first row (usually header)
                            foreach (var row in rows.Skip(1))
                            {
                                var cellValue = row.Cell(1).GetString().Trim();
                                if (!string.IsNullOrWhiteSpace(cellValue))
                                {
                                    reasons.Add(cellValue);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading Excel: {ex.Message}");
            }


            var databaseReasons = await _context.Leaves
                .Where(l => !string.IsNullOrWhiteSpace(l.LeaveReason))
                .Select(l => l.LeaveReason)
                .Distinct()
                .ToListAsync();

            foreach (var reason in databaseReasons)
            {
                reasons.Add(reason);
            }

            var sortedReasons = reasons.OrderBy(r => r).ToList();
            return Ok(sortedReasons);
        }

        [HttpGet("GetAllEmployeesWithDeptPos")]
        public async Task<ActionResult<List<object>>> GetAllEmployeesWithDeptPos()
        {
            var employees = await (from emp in _context.Employees
                                   join edp in _context.EmpDeptPositions on emp.EmpID equals edp.EmpID into edpJoin
                                   from edp in edpJoin.DefaultIfEmpty()
                                   join dept in _context.Departments on edp.DeptID equals dept.DeptID into deptJoin
                                   from dept in deptJoin.DefaultIfEmpty()
                                   join pos in _context.Positions on edp.PositionID equals pos.PositionID into posJoin
                                   from pos in posJoin.DefaultIfEmpty()
                                   orderby emp.FirstName, emp.LastName
                                   select new
                                   {
                                       emp.EmpID,
                                       emp.FirstName,
                                       emp.LastName,
                                       DeptID = edp.DeptID,
                                       DeptName = dept.DeptName,
                                       PositionName = pos.PositionName
                                   }).Where(employees => employees.EmpID != 1) // Exclude admin user with EmpID = 1)
                                   .ToListAsync();

            return Ok(employees);
        }

        private bool LeaveExists(int id)
        {
            return _context.Leaves.Any(e => e.LeaveID == id);
        }

        public class LeaveRequest
        {
            public int LeaveID { get; set; }
            public int EmpID { get; set; }
            public string? LeaveType { get; set; }
            public string? LeaveReason { get; set; }
            public bool IsApproved { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public DateTime? CreatedAt { get; set; }
            public int? OnDutyHours { get; set; }
            public IFormFile? File { get; set; }
            public int? ApprovedbyEmpID { get; set; }
        }

        public class LeaveReportRequest
        {
            public List<string> Fields { get; set; }
            public string? Status { get; set; }
            public string? LeaveType { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Department { get; set; }
            public int? EmpId { get; set; }
            public string Format { get; set; } = "JSON";
        }

        public class LeaveRegisterReportRequest
        {
            public string ViewType { get; set; } = "manager";
        }

        public class LeaveRegisterReportDto
        {
            public int EmpID { get; set; }
            public string EmpName { get; set; }
            public int LeavesTaken { get; set; }
            public int LeaveBalance { get; set; }
            public int ApprovedLeaves { get; set; }
            public int UnapprovedLeaves { get; set; }
            public int? NumberOfLOPs { get; set; }
            public int? LeaveToBeEncashed { get; set; }
        }
    }
}
