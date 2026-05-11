using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using MySqlX.XDevAPI;
using DocumentFormat.OpenXml.Bibliography;
using ClosedXML.Excel;
using System.Data;
using EMS.Services;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpAssessmentsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly Services.IUserActivityLogger _logger;

        public EmpAssessmentsController(EMSDbContext context, Services.IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpAssessments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpAssessment>>> GetEmpAssessments()
        {
            return await _context.EmpAssessments.ToListAsync();
        }

        // GET: api/EmpAssessments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpAssessment>> GetEmpAssessment(int id)
        {
            var empAssessment = await _context.EmpAssessments.Where(e => e.EmpID == id).OrderByDescending(e => e.EAID).FirstAsync();

            if (empAssessment == null)
            {
                return NotFound();
            }

            return empAssessment;
        }

        [HttpGet("GetReviewsbyReviewerID/{id}/{SessionID}")]
        public async Task<ActionResult<IEnumerable<EmpAssessment>>> GetReviewsbyReviewerID(int id, int SessionID)
        {
            var empAssessment = await _context.EmpAssessments.Where(e => e.SubmittedBy == id && e.RSID == SessionID).ToListAsync();
            if (empAssessment == null)
            {
                return NotFound();
            }

            return Ok(empAssessment);
        }
        [HttpGet("GetReviewofEmpID/{empID}")]
        public async Task<ActionResult<IEnumerable<EmpAssessment>>> GetReviewofEmpID(int empID)
        {
            // 1️⃣ Get the latest review of the employee (assuming higher ID or Date = latest)
            var lastReview = await _context.EmpAssessments
                .Where(e => e.EmpID == empID)
                .OrderByDescending(e => e.EAID) // or ReviewDate / ID
                .FirstOrDefaultAsync();

            if (lastReview == null)
                return NotFound("No reviews found for this employee.");

            // 2️⃣ Get the session from the last review
            var sessionId = lastReview.RSID;

            // 3️⃣ Fetch all reviews of the same session for that employee
            var sessionReviews = await _context.EmpAssessments
                .Where(e => e.EmpID == empID && e.RSID == sessionId)
                .ToListAsync();

            return Ok(sessionReviews);
        }


        [HttpGet("GetAllreviews/{id}/{sessionID}")]
        public async Task<ActionResult<IEnumerable<EmpAssessment>>> GetEmpAllAssessment(int id, int sessionID)
        {
            var today = DateTime.Today;
            var year = today.Year;
            var empAssessment = await _context.EmpAssessments.Where(e => e.EmpID == id && e.RSID == sessionID).ToListAsync();

            if (empAssessment == null)
            {
                return NotFound();
            }

            return empAssessment;
        }

        [HttpGet("GetEmployeeswithSingleReviews/{sessionID}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeeswithSingleReviews(int sessionID)
        {
            // Step 1: Get all employee IDs with exactly one review in this session
            var employeeIdsWithSingleReview = await _context.EmpAssessments
                .Where(e => e.RSID == sessionID)
                .GroupBy(e => e.EmpID)
                .Where(g => g.Count() == 1)
                .Select(g => g.Key)
                .ToListAsync();

            // Step 2: Fetch the employee details for those IDs
            var employees = await _context.Employees
                .Where(emp => employeeIdsWithSingleReview.Contains(emp.EmpID))
                .ToListAsync();

            // Step 3: Return the list of employees
            return Ok(employees);
        }


        [HttpGet("GetEmployeeswithMultipleReviews/{sessionID}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeeswithMultipleReviews(int sessionID)
        {
            // Step 1: Get all employee IDs with exactly one review in this session
            var employeeIdsWithMultipleReview = await _context.EmpAssessments
                .Where(e => e.RSID == sessionID)
                .GroupBy(e => e.EmpID)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToListAsync();

            // Step 2: Fetch the employee details for those IDs
            var employees = await _context.Employees
                .Where(emp => employeeIdsWithMultipleReview.Contains(emp.EmpID))
                .ToListAsync();

            // Step 3: Return the list of employees
            return Ok(employees);
        }

        [HttpPost("CalculateFinalScoreandRating")]
        public async Task<IActionResult> CalculateFinalScoreandRating(int RSID)
        {
            var assessments = await _context.EmpAssessments
                .Where(e => e.RSID == RSID)
                .ToListAsync();
            foreach (var assessment in assessments)
            {
                // Calculate Final Percentage
                assessment.FinalPercentage = Math.Round(((
                    (assessment.PerformanceScore ?? 0) * 0.5 +
                    (assessment.DisciplineScore ?? 0) * 0.3 +
                    (assessment.IntegrityScore ?? 0) * 0.2
                ) / 4) * 100, 0);

                // Determine Final Remark based on Final Percentage
                if (assessment.FinalPercentage == 0)
                {
                    assessment.Rating = "NA";
                }
                else if (assessment.FinalPercentage >= 91)
                {
                    assessment.Rating = "Outstanding";
                }
                else if (assessment.FinalPercentage >= 81)
                {
                    assessment.Rating = "Very Good";
                }
                else if (assessment.FinalPercentage >= 60)
                {
                    assessment.Rating = "Good";
                }
                else if (assessment.FinalPercentage >= 50)
                {
                    assessment.Rating = "Average";
                }
                else
                {
                    assessment.Rating = "Needs Improvement";
                }
            }
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Performance",
                "Calculate Final Scores",
                $"Calculated final scores and ratings for {assessments.Count} assessments in session {RSID}",
                "all",
                null,
                null
            );
            return Ok();
        }

        [HttpGet("GetReportForSingleAssessments")]
        public async Task<IActionResult> GetReportForSingleAssessments([FromQuery] int? sessionID = null)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "EmployeeAssessment.xlsx");

            if (!System.IO.File.Exists(templatePath))
                return NotFound("Template file not found on server.");

            // 1️⃣ Fetch assessments
            var query = _context.EmpAssessments.AsQueryable();

            if (sessionID.HasValue)
                query = query.Where(a => a.RSID == sessionID.Value);

            var allAssessments = await query.AsNoTracking().ToListAsync();

            // 2️⃣ Find employees with only one assessment
            var singleAssessmentEmpIds = allAssessments
                .Where(a => a.EmpID.HasValue)
                .GroupBy(a => a.EmpID)
                .Where(g => g.Count() == 1)
                .Select(g => g.Key!.Value)
                .ToList();

            if (!singleAssessmentEmpIds.Any())
                return BadRequest("No employees found with single assessments.");

            // 3️⃣ Fetch employees with their assessment details (JOIN for efficiency)
            var singleRows = await (
    from a in _context.EmpAssessments
    join e in _context.Employees on a.EmpID equals e.EmpID
    join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
    join d in _context.Departments on edp.DeptID equals d.DeptID
    join p in _context.Positions on edp.PositionID equals p.PositionID
    join r in _context.Employees on a.SubmittedBy equals r.EmpID into reviewerJoin
    from r in reviewerJoin.DefaultIfEmpty() // LEFT JOIN for reviewer
    where singleAssessmentEmpIds.Contains(a.EmpID ?? 0)
    select new
    {
        e.EmpID,
        e.FirstName,
        e.LastName,
        e.PersonalEmail,
        e.PhoneNumber,
        d.DeptName,
        p.PositionName,
        ReviewerName = r != null ? r.FirstName + " " + r.LastName : null,
        a.RSID,
        a.SubmittedAt,
        a.Month,
        a.Year,
        a.SelfDevelopment,
        a.EmployeeStaffDevelopment,
        a.DecisionMaking,
        a.ProductivityEfficiency,
        a.CallForDuty,
        a.PerformanceScore,
        a.AttendancePunctuality,
        a.BehaviourOverallDiscipline,
        a.DisciplineScore,
        a.Integrity,
        a.LoyaltySubmissionToCompanyGoals,
        a.IntegrityScore,
        a.FinalPercentage,
        a.FinalRemark,
    }
).AsNoTracking().ToListAsync();

            // 4️⃣ Open template
            using var workbook = new XLWorkbook(templatePath);
            var worksheet = workbook.Worksheets.First();
            var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 1;
            int currentRow = lastRow + 1;

            // 5️⃣ Write data rows
            foreach (var row in singleRows)
            {
                worksheet.Cell(currentRow, 1).Value = row.EmpID;
                worksheet.Cell(currentRow, 2).Value = $"{row.FirstName} {row.LastName}";
                worksheet.Cell(currentRow, 3).Value = row.SelfDevelopment;
                worksheet.Cell(currentRow, 4).Value = row.EmployeeStaffDevelopment;
                worksheet.Cell(currentRow, 5).Value = row.DecisionMaking;
                worksheet.Cell(currentRow, 6).Value = row.ProductivityEfficiency;
                worksheet.Cell(currentRow, 7).Value = row.CallForDuty;
                worksheet.Cell(currentRow, 8).Value = row.PerformanceScore;
                worksheet.Cell(currentRow, 9).Value = row.AttendancePunctuality;
                worksheet.Cell(currentRow, 10).Value = row.BehaviourOverallDiscipline;
                worksheet.Cell(currentRow, 11).Value = row.DisciplineScore;
                worksheet.Cell(currentRow, 12).Value = row.Integrity;
                worksheet.Cell(currentRow, 13).Value = row.LoyaltySubmissionToCompanyGoals;
                worksheet.Cell(currentRow, 14).Value = row.IntegrityScore;
                worksheet.Cell(currentRow, 15).Value = row.FinalPercentage;
                worksheet.Cell(currentRow, 16).Value = row.FinalRemark ?? "";
                worksheet.Cell(currentRow, 17).Value = row.ReviewerName ?? "";
                currentRow++;
            }

            worksheet.ColumnsUsed().AdjustToContents();

            // 6️⃣ Return Excel file
            using var stream = new MemoryStream();
            workbook.SaveAs(stream, true);
            stream.Position = 0;

            var fileName = $"SingleAssessments_{DateTime.Now:yyyyMMdd}.xlsx";

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }

        [HttpGet("GetReportForMultipleAssessments")]
        public async Task<IActionResult> GetReportForMultipleAssessments([FromQuery] int? sessionID = null)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "EmployeeAssessment.xlsx");

            if (!System.IO.File.Exists(templatePath))
                return NotFound("Template file not found on server.");

            // 1️⃣ Fetch assessments
            var query = _context.EmpAssessments.AsQueryable();

            if (sessionID.HasValue)
                query = query.Where(a => a.RSID == sessionID.Value);

            var allAssessments = await query.AsNoTracking().ToListAsync();

            // 2️⃣ Find employees with only one assessment
            var singleAssessmentEmpIds = allAssessments
                .Where(a => a.EmpID.HasValue)
                .GroupBy(a => a.EmpID)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key!.Value)
                .ToList();

            if (!singleAssessmentEmpIds.Any())
                return BadRequest("No employees found with multiple assessments.");

            // 3️⃣ Fetch employees with their assessment details (JOIN for efficiency)
            var singleRows = await (
    from a in _context.EmpAssessments
    join e in _context.Employees on a.EmpID equals e.EmpID
    join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
    join d in _context.Departments on edp.DeptID equals d.DeptID
    join p in _context.Positions on edp.PositionID equals p.PositionID
    join r in _context.Employees on a.SubmittedBy equals r.EmpID into reviewerJoin
    from r in reviewerJoin.DefaultIfEmpty() // LEFT JOIN for reviewer
    where singleAssessmentEmpIds.Contains(a.EmpID ?? 0)
    select new
    {
        e.EmpID,
        e.FirstName,
        e.LastName,
        e.PersonalEmail,
        e.PhoneNumber,
        d.DeptName,
        p.PositionName,
        ReviewerName = r != null ? r.FirstName + " " + r.LastName : null,
        a.RSID,
        a.SubmittedAt,
        a.Month,
        a.Year,
        a.SelfDevelopment,
        a.EmployeeStaffDevelopment,
        a.DecisionMaking,
        a.ProductivityEfficiency,
        a.CallForDuty,
        a.PerformanceScore,
        a.AttendancePunctuality,
        a.BehaviourOverallDiscipline,
        a.DisciplineScore,
        a.Integrity,
        a.LoyaltySubmissionToCompanyGoals,
        a.IntegrityScore,
        a.FinalPercentage,
        a.FinalRemark,
    }
).AsNoTracking().ToListAsync();

            // 4️⃣ Open template
            using var workbook = new XLWorkbook(templatePath);
            var worksheet = workbook.Worksheets.First();
            var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 1;
            int currentRow = lastRow + 1;

            // 5️⃣ Write data rows
            foreach (var row in singleRows)
            {
                worksheet.Cell(currentRow, 1).Value = row.EmpID;
                worksheet.Cell(currentRow, 2).Value = $"{row.FirstName} {row.LastName}";
                /*                worksheet.Cell(currentRow, 3).Value = row.DeptName;
                                worksheet.Cell(currentRow, 4).Value = row.PositionName;
                                worksheet.Cell(currentRow, 5).Value = row.Month;
                                worksheet.Cell(currentRow, 6).Value = row.Year;*/
                worksheet.Cell(currentRow, 3).Value = row.SelfDevelopment;
                worksheet.Cell(currentRow, 4).Value = row.EmployeeStaffDevelopment;
                worksheet.Cell(currentRow, 5).Value = row.DecisionMaking;
                worksheet.Cell(currentRow, 6).Value = row.ProductivityEfficiency;
                worksheet.Cell(currentRow, 7).Value = row.CallForDuty;
                worksheet.Cell(currentRow, 8).Value = row.PerformanceScore;
                worksheet.Cell(currentRow, 9).Value = row.AttendancePunctuality;
                worksheet.Cell(currentRow, 10).Value = row.BehaviourOverallDiscipline;
                worksheet.Cell(currentRow, 11).Value = row.DisciplineScore;
                worksheet.Cell(currentRow, 12).Value = row.Integrity;
                worksheet.Cell(currentRow, 13).Value = row.LoyaltySubmissionToCompanyGoals;
                worksheet.Cell(currentRow, 14).Value = row.IntegrityScore;
                worksheet.Cell(currentRow, 15).Value = row.FinalPercentage;
                worksheet.Cell(currentRow, 16).Value = row.FinalRemark ?? "";
                /*                worksheet.Cell(currentRow, 17).Value = row.SubmittedAt?.ToString("dd-MM-yyyy") ?? "";*/
                worksheet.Cell(currentRow, 17).Value = row.ReviewerName ?? "N/A";
                currentRow++;
            }

            worksheet.ColumnsUsed().AdjustToContents();

            // 6️⃣ Return Excel file
            await using var ms = new MemoryStream();
            workbook.SaveAs(ms, false); // false = don’t close stream
            ms.Flush();
            ms.Seek(0, SeekOrigin.Begin);

            var bytes = ms.ToArray();

            return File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"SingleAssessments_{DateTime.Now:yyyyMMdd}.xlsx"
            );
        }

        [HttpGet("DownloadTemplate/{id}/{ln}")]
        public async Task<IActionResult> DownloadTemplate(int id, string ln)
        {
            // 1️⃣ Select template based on language
            string fileName = ln.ToLower() == "hin"
                ? "EmployeeAssessment (Hindi).xlsx"
                : "EmployeeAssessment.xlsx";

            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), fileName);

            if (!System.IO.File.Exists(templatePath))
                return NotFound($"Template file '{fileName}' not found on server.");

            // 2️⃣ Fetch employees reporting to the given manager ID
            var employees = _context.Employees
    .AsEnumerable()
    .Where(e => e.ReportsTo != null && e.ReportsTo.Contains(id))
    .Select(e => new
    {
        e.EmpID,
        FullName = e.FirstName + " " + e.LastName
    })
    .ToList();

            if (!employees.Any())
                return NotFound("No employees found reporting to this manager.");

            // 3️⃣ Open Excel template
            using var workbook = new XLWorkbook(templatePath);
            var worksheet = workbook.Worksheets.First();

            // Optional: clear any existing data rows if needed
            var headerRow = 3; // assuming headers are in row 3
            int currentRow = headerRow + 1;

            // 4️⃣ Populate EmpID and Name columns
            foreach (var emp in employees)
            {
                worksheet.Cell(currentRow, 1).Value = emp.EmpID;
                worksheet.Cell(currentRow, 2).Value = emp.FullName;
                worksheet.Cell(currentRow, 8).FormulaA1 = $"AVERAGE(C{currentRow}:G{currentRow})";

                // Average of columns 9 and 10 → column 11
                worksheet.Cell(currentRow, 11).FormulaA1 = $"AVERAGE(I{currentRow}:J{currentRow})";

                // Average of columns 12 and 13 → column 14
                worksheet.Cell(currentRow, 14).FormulaA1 = $"AVERAGE(L{currentRow}:M{currentRow})";

                // Weighted final score → column 15
                // Formula: ((8th * 0.6) + (11th * 0.2) + (14th * 0.2)) / 4 * 100
                worksheet.Cell(currentRow, 15).FormulaA1 =
                    $"=((H{currentRow}*0.6)+(K{currentRow}*0.2)+(N{currentRow}*0.2))/4*100";

                worksheet.Cell(currentRow, 16).FormulaA1 =
        $"=IF(O{currentRow}>=91,\"Outstanding\"," +
        $"IF(O{currentRow}>=81,\"Very Good\"," +
        $"IF(O{currentRow}>=60,\"Good\"," +
        $"IF(O{currentRow}>=50,\"Average\",\"Need Improvement\"))))";
                currentRow++;
            }

            worksheet.ColumnsUsed().AdjustToContents();

            // 5️⃣ Return file as download
            await using var ms = new MemoryStream();
            workbook.SaveAs(ms, false);
            ms.Position = 0;

            string outputFileName = ln.ToLower() == "hin"
                ? $"AssessmentTemplate_Hindi_{DateTime.Now:yyyyMMdd}.xlsx"
                : $"AssessmentTemplate_{DateTime.Now:yyyyMMdd}.xlsx";

            return File(
                ms.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                outputFileName
            );
        }


        [HttpGet("StatsforReviewer/{id:int}/{sessionID:int}")]
        public async Task<ActionResult<object>> GetReviewStats(int id, int sessionID)
        {
            // 1️⃣ Fetch all employees (for client-side filtering)
            var allEmployees = await _context.Employees
                .AsNoTracking()
                .ToListAsync();

            // Handle ReportsTo as List<int>
            var directReportIDs = allEmployees
                .Where(e => e.ReportsTo != null && e.ReportsTo.Contains(id))
                .Select(e => e.EmpID)
                .ToList();

            // 2️⃣ Get Random (Assigned) Employees
            var randomAssignments = await _context.RandomAssessments
                .AsNoTracking()
                .Where(r => r.AssessorID == id && r.RSID == sessionID)
                .ToListAsync();

            var assignedEmpIDs = randomAssignments
                .Where(r => r.AssesseeIDs != null)
                .SelectMany(r => r.AssesseeIDs!)
                .Distinct()
                .ToList();

            // 3️⃣ Get all reviewed employees
            var reviewedEmpIDs = await _context.EmpAssessments
                .Where(a => a.SubmittedBy == id && a.RSID == sessionID && a.EmpID != null)
                .Select(a => a.EmpID.Value)
                .Distinct()
                .ToListAsync();

            // 4️⃣ Compute counts
            var reviewedDirect = reviewedEmpIDs.Intersect(directReportIDs).Count();
            var remainingDirect = directReportIDs.Count - reviewedDirect;

            var reviewedAssigned = reviewedEmpIDs.Intersect(assignedEmpIDs).Count();
            var remainingAssigned = assignedEmpIDs.Count - reviewedAssigned;

            // 5️⃣ Return structured stats
            var stats = new
            {
                ReviewerID = id,
                SessionID = sessionID,
                DirectReviews = new
                {
                    TotalEmployees = directReportIDs.Count,
                    Completed = reviewedDirect,
                    Remaining = Math.Max(0, remainingDirect)
                },
                AssignedReviews = new
                {
                    TotalEmployees = assignedEmpIDs.Count,
                    Completed = reviewedAssigned,
                    Remaining = Math.Max(0, remainingAssigned)
                },
                Overall = new
                {
                    TotalEmployees = directReportIDs.Count + assignedEmpIDs.Count,
                    Completed = reviewedDirect + reviewedAssigned,
                    Remaining = Math.Max(0, (directReportIDs.Count + assignedEmpIDs.Count) - (reviewedDirect + reviewedAssigned))
                }
            };

            return Ok(stats);
        }

        [HttpGet("StatsforHR/{id:int}/{sessionID:int}")]
        public async Task<ActionResult<object>> GetHRReviewStats(int id, int sessionID)
        {
            // Get the HR user's employee record first
            var hrUser = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmpID == id);

            if (hrUser == null)
                return NotFound("Reviewer not found.");

            // 1️⃣ Fetch all employees except:
            // - The HR user themselves
            // - The person(s) they report to
            var allEmployees = await _context.Employees
                .AsNoTracking()
                .Where(e =>
                    e.EmpID != id && // exclude self
                    (hrUser.ReportsTo == null || !hrUser.ReportsTo.Contains(e.EmpID)) // exclude HR’s own manager(s)
                )
                .Select(e => e.EmpID)
                .ToListAsync();

            // 2️⃣ Get all employees already reviewed by this HR user for this session
            var reviewedEmpIDs = await _context.EmpAssessments
                .Where(a => a.SubmittedBy == id && a.RSID == sessionID && a.EmpID != null)
                .Select(a => a.EmpID.Value)
                .Distinct()
                .ToListAsync();

            // 3️⃣ Compute stats
            var totalEmployees = allEmployees.Count;
            var completed = reviewedEmpIDs.Intersect(allEmployees).Count();
            var remaining = Math.Max(0, totalEmployees - completed);

            // 4️⃣ Return structured response
            var stats = new
            {
                ReviewerID = id,
                SessionID = sessionID,
                HRReviews = new
                {
                    TotalEmployees = totalEmployees,
                    Completed = completed,
                    Remaining = remaining
                },
                Overall = new
                {
                    TotalEmployees = totalEmployees,
                    Completed = completed,
                    Remaining = remaining
                }
            };

            return Ok(stats);
        }





        [HttpPost("LockReviewsbySession/{sessionID}")]
        public async Task<IActionResult> LockReviewsbySession(int sessionID)
        {
            var Session = await _context.ReviewSessions.FindAsync(sessionID);
            if (Session == null)
            {
                return NotFound("Review session not found.");
            }
            Session.IsLocked = true;
            await _context.SaveChangesAsync();

            var assessments = await _context.EmpAssessments.Where(e => e.RSID == sessionID).ToListAsync();

            if (assessments == null || assessments.Count == 0)
            {
                return NotFound("No assessments found for the given session ID.");
            }

            foreach (var assessment in assessments)
            {
                assessment.IsLocked = true;
            }

            try
            {
                await _context.SaveChangesAsync();
                await _logger.LogActivityAsync(
                    "Performance",
                    "Lock Session",
                    $"Locked review session {sessionID} and {assessments.Count} associated assessments",
                    "all",
                    null,
                    null
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while locking the assessments.");
            }

            return Ok("Assessments locked successfully.");
        }



        // PUT: api/EmpAssessments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpAssessment(int id, EmpAssessment empAssessment)
        {
            if (id != empAssessment.EAID)
            {
                return BadRequest();
            }

            var oldAssessment = await _context.EmpAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.EAID == id);
            _context.Entry(empAssessment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                await _logger.LogActivityAsync(
                    "Performance",
                    "Update Assessment",
                    $"Updated assessment for employee ID {empAssessment.EmpID} in session {empAssessment.RSID}",
                    empAssessment.EmpID?.ToString() ?? "unknown",
                    System.Text.Json.JsonSerializer.Serialize(oldAssessment),
                    System.Text.Json.JsonSerializer.Serialize(empAssessment)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpAssessmentExists(id))
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

        // POST: api/EmpAssessments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpAssessment>> PostEmpAssessment(EmpAssessment empAssessment)
        {
            var existingAssessment = await _context.EmpAssessments
                .FirstOrDefaultAsync(e => e.EmpID == empAssessment.EmpID && e.RSID == empAssessment.RSID && e.SubmittedBy == empAssessment.SubmittedBy);

            if (existingAssessment != null)
            {
                var oldAssessment = System.Text.Json.JsonSerializer.Serialize(existingAssessment);
                existingAssessment.SelfDevelopment = empAssessment.SelfDevelopment;
                existingAssessment.EmployeeStaffDevelopment = empAssessment.EmployeeStaffDevelopment;
                existingAssessment.DecisionMaking = empAssessment.DecisionMaking;
                existingAssessment.ProductivityEfficiency = empAssessment.ProductivityEfficiency;
                existingAssessment.CallForDuty = empAssessment.CallForDuty;
                existingAssessment.PerformanceScore = empAssessment.PerformanceScore;
                existingAssessment.AttendancePunctuality = empAssessment.AttendancePunctuality;
                existingAssessment.BehaviourOverallDiscipline = empAssessment.BehaviourOverallDiscipline;
                existingAssessment.DisciplineScore = empAssessment.DisciplineScore;
                existingAssessment.Integrity = empAssessment.Integrity;
                existingAssessment.LoyaltySubmissionToCompanyGoals = empAssessment.LoyaltySubmissionToCompanyGoals;
                existingAssessment.IntegrityScore = empAssessment.IntegrityScore;
                existingAssessment.FinalPercentage = empAssessment.FinalPercentage;
                existingAssessment.SubmittedAt = DateTime.Now;
                existingAssessment.Month = empAssessment.Month;
                existingAssessment.Year = empAssessment.Year;
                existingAssessment.SubmittedBy = empAssessment.SubmittedBy;
                existingAssessment.RSID = empAssessment.RSID;
                existingAssessment.FinalRemark = empAssessment.FinalRemark;
                await _context.SaveChangesAsync();
                await _logger.LogActivityAsync(
                    "Performance",
                    "Update Assessment",
                    $"Updated assessment for employee ID {empAssessment.EmpID} in session {empAssessment.RSID}",
                    empAssessment.EmpID?.ToString() ?? "unknown",
                    oldAssessment,
                    System.Text.Json.JsonSerializer.Serialize(existingAssessment)
                );
                return Ok(existingAssessment);
            }

            // Create new record if not found
            empAssessment.SubmittedAt = DateTime.Now;
            _context.EmpAssessments.Add(empAssessment);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Performance",
                "Create Assessment",
                $"Created new assessment for employee ID {empAssessment.EmpID} in session {empAssessment.RSID}",
                empAssessment.EmpID?.ToString() ?? "unknown",
                null,
                System.Text.Json.JsonSerializer.Serialize(empAssessment)
            );

            return CreatedAtAction("GetEmpAssessment", new { id = empAssessment.EAID }, empAssessment);
        }



        // DELETE: api/EmpAssessments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpAssessment(int id)
        {
            var empAssessment = await _context.EmpAssessments.FindAsync(id);
            if (empAssessment == null)
            {
                return NotFound();
            }

            _context.EmpAssessments.Remove(empAssessment);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Performance",
                "Delete Assessment",
                $"Deleted assessment ID {id} for employee ID {empAssessment.EmpID}",
                empAssessment.EmpID?.ToString() ?? "unknown",
                System.Text.Json.JsonSerializer.Serialize(empAssessment),
                null
            );

            return NoContent();
        }

        private bool EmpAssessmentExists(int id)
        {
            return _context.EmpAssessments.Any(e => e.EAID == id);
        }
    }
}
