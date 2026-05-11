using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using ClosedXML.Excel;
using System.Data;
using EMS.Services;
using System.IO;
using NPOI.OpenXmlFormats.Dml;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpIncrementsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly Services.IIncrementProcessor _incrementProcessor;
        private readonly Services.IUserActivityLogger _logger;

        public EmpIncrementsController(EMSDbContext context, Services.IIncrementProcessor incrementProcessor, Services.IUserActivityLogger logger)
        {
            _context = context;
            _incrementProcessor = incrementProcessor;
            _logger = logger;
        }

        // GET: api/EmpIncrements
        [HttpGet]
        public async Task<ActionResult<object>> GetEmpIncrements(
    string? search = null,
    string? approvalStatus = null,
    DateTime? fromDate = null,
    DateTime? toDate = null)
        {
            var query = from i in _context.EmpIncrements
                        join e in _context.Employees on i.EmpID equals e.EmpID
                        select new
                        {
                            i.IncrementID,
                            i.EmpID,
                            EmployeeName = e.FirstName + " " + (e.LastName ?? ""),
                            i.PreviousCTC,
                            i.IncrementPercentage,
                            i.IncrementAmount,
                            i.NewCTC,
                            i.WEFDate,
                            i.ApprovalStatus,
                            i.IsProcessed,
                            i.ArrearsAmount,
                            i.ArrearsPaid,
                            i.CreatedAt
                        };

            // 🔎 Generic Search (Employee Name, CTC, etc.)
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();

                query = query.Where(x =>
                    x.EmployeeName.ToLower().Contains(search) ||
                    x.PreviousCTC.ToString().Contains(search) ||
                    x.NewCTC.ToString().Contains(search));
            }

            // 🔎 Approval Status Filter
            if (!string.IsNullOrEmpty(approvalStatus))
            {
                query = query.Where(x => x.ApprovalStatus == approvalStatus);
            }

            // 🔎 Date Range Filter
            if (fromDate.HasValue)
            {
                query = query.Where(x => x.WEFDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(x => x.WEFDate <= toDate.Value);
            }

            var data = await query
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/EmpIncrements/Employee/5
        [HttpGet("Employee/{empId}")]
        public async Task<ActionResult<IEnumerable<EmpIncrement>>> GetEmployeeIncrements(int empId)
        {
            return await _context.EmpIncrements
                .Where(i => i.EmpID == empId)
                .OrderByDescending(i => i.WEFDate)
                .ToListAsync();
        }

        [HttpPost("BulkUpload")]
        public async Task<IActionResult> BulkUpload(List<EmpIncrementInputModel> inputs, [FromQuery] int? sessionId)
        {
            if (inputs == null || !inputs.Any())
                return BadRequest("No data provided.");

            var increments = new List<EmpIncrement>();
            var errors = new List<string>();

            foreach (var input in inputs)
            {
                try
                {
                    int empId = input.EmpID;
                    decimal incrementPercentage = input.IncrementPercentage;
                    DateTime wefDate = input.WEF;

                    // Fetch current CTC
                    var currentPayroll = await _context.EmpCTCandPayrolls
                        .Where(p => p.EmpID == empId)
                        .OrderByDescending(p => p.EffectiveDate)
                        .FirstOrDefaultAsync();

                    if (currentPayroll == null)
                    {
                        errors.Add($"Employee ID {empId}: No current CTC found.");
                        continue;
                    }

                    // Calculate values based on Gross Salary as per requirement
                    decimal previousGross = currentPayroll.GrossSalary;
                    decimal incrementAmount =Math.Round(((previousGross * incrementPercentage) / 100) / 100,0,MidpointRounding.AwayFromZero) * 100;
                    decimal newGross = Math.Round((previousGross + incrementAmount)/100) * 100;

                    // Calculate new EPF if applicable (12% of Basic, capped at 1800)
                    decimal newEpf = 0;
                    if (currentPayroll.EpfApplicable)
                    {
                        // Maintain the same ratio of Basic to Gross
                        decimal basicRatio = previousGross > 0 ? currentPayroll.BasicSalary / previousGross : 0.5m;
                        decimal newBasic = newGross * basicRatio;
                        newEpf = Math.Min(newBasic * 0.12m, 1800m);
                    }

                    decimal newCtc = newGross + newEpf;
                    decimal previousCtc = currentPayroll.CtcAmount;

                    // Check if an increment already exists for this employee and WEF date
                    var existing = await _context.EmpIncrements
                        .AnyAsync(i => i.EmpID == empId && i.WEFDate.Date == wefDate.Date);

                    if (existing)
                    {
                        errors.Add($"Employee ID {empId}: Increment for {wefDate:yyyy-MM-dd} already exists.");
                        continue;
                    }

                    var increment = new EmpIncrement
                    {
                        EmpID = empId,
                        PreviousCTC = previousCtc,
                        PreviousEffectiveDate = currentPayroll.EffectiveDate,
                        IncrementPercentage = incrementPercentage,
                        IncrementAmount = incrementAmount,
                        NewCTC = newCtc,
                        WEFDate = wefDate,
                        ApprovalStatus = "Pending",
                        IsProcessed = false,
                        CreatedAt = DateTime.Now,
                        SessionID = sessionId // Added SessionID
                    };

                    increments.Add(increment);
                }
                catch (Exception ex)
                {
                    errors.Add($"EmpID {input.EmpID}: {ex.Message}");
                }
            }

            if (increments.Any())
            {
                _context.EmpIncrements.AddRange(increments);
                await _context.SaveChangesAsync();
                await _logger.LogActivityAsync(
                    "Payroll",
                    "Bulk Increment Upload",
                    $"Successfully uploaded {increments.Count} increments for session {sessionId}",
                    "all",
                    null,
                    System.Text.Json.JsonSerializer.Serialize(increments)
                );
            }

            return Ok(new
            {
                Message = $"{increments.Count} increments uploaded successfully.",
                Errors = errors
            });
        }

        //[HttpGet("GenerateLetters")]
        //public async Task<IActionResult> GenerateLetters([FromQuery] int sessionId, [FromQuery] int? deptId, [FromQuery] int? empId, [FromQuery] int? templateId)
        //{
        //    var query = from i in _context.EmpIncrements
        //                join e in _context.Employees on i.EmpID equals e.EmpID
        //                join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
        //                join d in _context.Departments on edp.DeptID equals d.DeptID
        //                join p in _context.Positions on edp.PositionID equals p.PositionID
        //                where i.SessionID == sessionId
        //                select new { i, e, d, p };

        //    if (empId.HasValue)
        //    {
        //        query = query.Where(x => x.e.EmpID == empId.Value);
        //    }
        //    else if (deptId.HasValue)
        //    {
        //        query = query.Where(x => x.d.DeptID == deptId.Value);
        //    }

        //    var results = await query.ToListAsync();

        //    if (!results.Any()) return NotFound("No increments found for the given criteria.");

        //    LetterTemplate template;
        //    if (templateId.HasValue)
        //    {
        //        template = await _context.LetterTemplates.FindAsync(templateId.Value);
        //    }
        //    else
        //    {
        //        template = await _context.LetterTemplates.FirstOrDefaultAsync(t => t.IsActive);
        //    }

        //    if (template == null) return BadRequest("No active letter template found.");

        //    var signatory = await _context.SignatorySettings.FirstOrDefaultAsync(s => s.IsDefault && s.IsActive) 
        //                   ?? await _context.SignatorySettings.FirstOrDefaultAsync(s => s.IsActive);

        //    var letters = new List<object>();

        //    foreach (var res in results)
        //    {
        //        string content = template.Content;
        //        content = content.Replace("[FirstName]", $"{res.e.FirstName} {res.e.LastName}")
        //                         .Replace("[EmployeeName]", $"{res.e.FirstName} {res.e.LastName}")
        //                         .Replace("[EmployeeCode]", res.e.EmpID.ToString())
        //                         .Replace("[Designation]", res.p.PositionName)
        //                         .Replace("[Department]", res.d.DeptName)
        //                         .Replace("[PreviousCTC]", res.i.PreviousCTC.ToString("N2"))
        //                         .Replace("[PreviousMonthlySalary]", (res.i.PreviousCTC).ToString("N2"))
        //                         .Replace("[IncrementAmount]", res.i.IncrementAmount.ToString("N2"))
        //                         .Replace("[IncrementPercentage]", res.i.IncrementPercentage.ToString("N2"))
        //                         .Replace("[NewCTC]", res.i.NewCTC.ToString("N2"))
        //                         .Replace("[NewMonthlySalary]", (res.i.NewCTC).ToString("N2"))
        //                         .Replace("[WEFDate]", res.i.WEFDate.ToString("dd-MMM-yyyy"))
        //                         .Replace("[NextMonth]", res.i.WEFDate.AddMonths(1).ToString("MMMM yyyy"))
        //                         .Replace("[Date]", DateTime.Now.ToString("MMMM d, yyyy"))
        //                         .Replace("[ThisMonth]", DateTime.Now.ToString("MMMM yyyy"));

        //        if (signatory != null)
        //        {
        //            content = content.Replace("[SignatoryName]", signatory.Name)
        //                             .Replace("[SignatoryDesignation]", signatory.Designation)
        //                             .Replace("[SignatorySignature]", $"<div style='margin-bottom:10px;'><img src=\"{signatory.SignatureImagePath}\" style=\"height:60px;\" /></div>");
        //        }
        //        else
        //        {
        //            content = content.Replace("[SignatoryName]", "")
        //                             .Replace("[SignatoryDesignation]", "")
        //                             .Replace("[SignatorySignature]", "");
        //        }

        //        letters.Add(new
        //        {
        //            EmpID = res.e.EmpID,
        //            EmployeeName = $"{res.e.FirstName} {res.e.LastName}",
        //            HtmlContent = content
        //        });
        //    }

        //    return Ok(letters);
        //}

        [HttpGet("GenerateLetters")]
        public async Task<IActionResult> GenerateLetters([FromQuery] int sessionId, [FromQuery] int? deptId, [FromQuery] int? empId, [FromQuery] int? templateId)
        {
            var query = from i in _context.EmpIncrements
                        join e in _context.Employees on i.EmpID equals e.EmpID
                        join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
                        join d in _context.Departments on edp.DeptID equals d.DeptID
                        join p in _context.Positions on edp.PositionID equals p.PositionID
                        where i.SessionID == sessionId
                        select new { i, e, d, p };

            if (empId.HasValue)
            {
                query = query.Where(x => x.e.EmpID == empId.Value);
            }
            else if (deptId.HasValue)
            {
                query = query.Where(x => x.d.DeptID == deptId.Value);
            }

            var results = await query.ToListAsync();
            if (!results.Any()) return NotFound("No increments found for the given criteria.");

            LetterTemplate template;
            if (templateId.HasValue)
            {
                template = await _context.LetterTemplates.FindAsync(templateId.Value);
            }
            else
            {
                template = await _context.LetterTemplates.FirstOrDefaultAsync(t => t.IsActive);
            }
            if (template == null) return BadRequest("No active letter template found.");

            var signatory = await _context.SignatorySettings.FirstOrDefaultAsync(s => s.IsDefault && s.IsActive)
                           ?? await _context.SignatorySettings.FirstOrDefaultAsync(s => s.IsActive);

            var rootdirectory = Directory.GetCurrentDirectory();
            // Path to your letterpad image (letterhead + watermark)
            string letterpadPath = Path.Combine(rootdirectory, "images", "company-letterpad.png");
            string letterpadBase64 = "";
            if (System.IO.File.Exists(letterpadPath))
            {
                byte[] imageArray = System.IO.File.ReadAllBytes(letterpadPath);
                letterpadBase64 = "data:image/png;base64," + Convert.ToBase64String(imageArray);
            }

            var letters = new List<object>();
            foreach (var res in results)
            {
                string content = template.Content;
                content = content.Replace("[FirstName]", $"{res.e.FirstName} {res.e.LastName}")
                                 .Replace("[EmployeeName]", $"{res.e.FirstName} {res.e.LastName}")
                                 .Replace("[EmployeeCode]", res.e.EmpID.ToString())
                                 .Replace("[Designation]", res.p.PositionName)
                                 .Replace("[Department]", res.d.DeptName)
                                 .Replace("[PreviousCTC]", res.i.PreviousCTC.ToString("N2"))
                                 .Replace("[PreviousMonthlySalary]", (res.i.PreviousCTC).ToString("N2"))
                                 .Replace("[IncrementAmount]", res.i.IncrementAmount.ToString("N2"))
                                 .Replace("[IncrementPercentage]", res.i.IncrementPercentage.ToString("N2"))
                                 .Replace("[NewCTC]", res.i.NewCTC.ToString("N2"))
                                 .Replace("[NewMonthlySalary]", (res.i.NewCTC).ToString("N2"))
                                 .Replace("[WEFDate]", res.i.WEFDate.ToString("dd-MMM-yyyy"))
                                 .Replace("[NextMonth]", res.i.WEFDate.AddMonths(1).ToString("MMMM yyyy"))
                                 .Replace("[Date]", DateTime.Now.ToString("MMMM d, yyyy"))
                                 .Replace("[ThisMonth]", DateTime.Now.ToString("MMMM yyyy"));

                if (signatory != null)
                {
                    string sigBase64 = "";
                    if (!string.IsNullOrEmpty(signatory.SignatureImagePath))
                    {
                        string sigPath = Path.Combine(rootdirectory, "wwwroot", signatory.SignatureImagePath.TrimStart('/'));
                        if (System.IO.File.Exists(sigPath))
                        {
                            byte[] sigBytes = System.IO.File.ReadAllBytes(sigPath);
                            sigBase64 = "data:image/png;base64," + Convert.ToBase64String(sigBytes);
                        }
                    }

                    content = content.Replace("[SignatoryName]", signatory.Name)
                                     .Replace("[SignatoryDesignation]", signatory.Designation);
                    
                    if (!string.IsNullOrEmpty(sigBase64))
                    {
                        content = content.Replace("[SignatorySignature]", $"<div style='margin-bottom:10px;'><img src=\"{sigBase64}\" style=\"height:60px;\" /></div>");
                    }
                    else
                    {
                        content = content.Replace("[SignatorySignature]", "");
                    }
                }
                else
                {
                    content = content.Replace("[SignatoryName]", "")
                                     .Replace("[SignatoryDesignation]", "")
                                     .Replace("[SignatorySignature]", "");
                }

                // Wrap content with letterpad background - A4 size format
                string finalContent = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        @media print {{
            @page {{ 
                margin: 0; 
                size: A4;
            }}
            body {{ margin: 0; }}
        }}
        * {{
            box-sizing: border-box;
            -moz-box-sizing: border-box;
        }}
        .letter-page {{
            position: relative;
            display: block;
            width: 794px;
            height: 1123px;
            margin: 0 auto;
            background-color: white;
            background-image: url(""{letterpadBase64}"");
            background-size: 100% 100%;
            background-position: center;
            background-repeat: no-repeat;
            padding: 120px 80px 80px 80px;
            overflow: hidden;
        }}
        .content-area {{
            position: relative;
            z-index: 1;
        }}
    </style>
</head>
<body style='margin: 0; padding: 0;'>
    <div class='letter-page'>
        <div class='content-area'>
            {content}
        </div>
    </div>
</body>
</html>";

                letters.Add(new
                {
                    EmpID = res.e.EmpID,
                    EmployeeName = $"{res.e.FirstName} {res.e.LastName}",
                    HtmlContent = finalContent
                });
            }

            return Ok(letters);
        }

        public class EmpIncrementInputModel
        {
            public int EmpID { get; set; }
            public decimal IncrementPercentage { get; set; }
            public DateTime WEF { get; set; }
        }

        // POST: api/EmpIncrements/Approve/5
        [HttpPost("Approve/{id}")]
        public async Task<IActionResult> ApproveIncrement(int id)
        {
            var increment = await _context.EmpIncrements.FindAsync(id);
            if (increment == null) return NotFound();

            var oldStatus = increment.ApprovalStatus;
            increment.ApprovalStatus = "Approved";
            await _context.SaveChangesAsync();

            // Run processing immediately for past/today WEF dates
            await _incrementProcessor.ProcessPendingIncrementsAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Approve Increment",
                $"Approved increment ID {id} for employee ID {increment.EmpID}",
                increment.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(new { ApprovalStatus = oldStatus }),
                System.Text.Json.JsonSerializer.Serialize(increment)
            );

            return Ok(new { Message = "Increment approved successfully." });
        }

        // POST: api/EmpIncrements/BulkApprove
        [HttpPost("BulkApprove")]
        public async Task<IActionResult> BulkApprove([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any()) return BadRequest("No IDs provided");

            var increments = await _context.EmpIncrements
                .Where(i => ids.Contains(i.IncrementID) && i.ApprovalStatus == "Pending")
                .ToListAsync();

            foreach (var increment in increments)
            {
                increment.ApprovalStatus = "Approved";
            }

            await _context.SaveChangesAsync();

            // Run processing immediately for past/today WEF dates
            await _incrementProcessor.ProcessPendingIncrementsAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Bulk Approve Increments",
                $"Approved {increments.Count} increments",
                "all",
                null,
                System.Text.Json.JsonSerializer.Serialize(increments)
            );

            return Ok(new { Message = $"{increments.Count} increments approved successfully." });
        }

        // POST: api/EmpIncrements/ManualProcess
        [HttpPost("ManualProcess")]
        public async Task<IActionResult> ManualProcess()
        {
            int count = await _incrementProcessor.ProcessPendingIncrementsAsync();
            await _logger.LogActivityAsync(
                "Payroll",
                "Manual Increment Process",
                $"Manually triggered processing of {count} increments",
                "all",
                null,
                null
            );
            return Ok(new { Message = $"{count} increments processed successfully." });
        }

        // DELETE: api/EmpIncrements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncrement(int id)
        {
            var increment = await _context.EmpIncrements.FindAsync(id);
            if (increment == null) return NotFound();

            if (increment.IsProcessed)
            {
                return BadRequest("Processed increments cannot be deleted directly. Please roll back first.");
            }

            _context.EmpIncrements.Remove(increment);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Payroll",
                "Delete Increment",
                $"Deleted increment ID {id} for employee ID {increment.EmpID}",
                increment.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(increment),
                null
            );

            return Ok(new { Message = "Increment deleted successfully." });
        }

        // POST: api/EmpIncrements/BulkDelete
        [HttpPost("BulkDelete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any()) return BadRequest("No IDs provided");

            var increments = await _context.EmpIncrements
                .Where(i => ids.Contains(i.IncrementID) && !i.IsProcessed)
                .ToListAsync();

            if (!increments.Any()) return Ok(new { Message = "No deletable increments found." });

            _context.EmpIncrements.RemoveRange(increments);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Bulk Delete Increments",
                $"Deleted {increments.Count} increments",
                "all",
                null,
                System.Text.Json.JsonSerializer.Serialize(increments)
            );

            return Ok(new { Message = $"{increments.Count} increments deleted successfully." });
        }

        // POST: api/EmpIncrements/Rollback/5
        [HttpPost("Rollback/{id}")]
        public async Task<IActionResult> RollbackIncrement(int id)
        {
            var increment = await _context.EmpIncrements.FindAsync(id);
            if (increment == null) return NotFound();

            var oldIncrementData = System.Text.Json.JsonSerializer.Serialize(increment);

            if (increment.IsProcessed)
            {
                var currentPayroll = await _context.EmpCTCandPayrolls
                    .Where(p => p.EmpID == increment.EmpID)
                    .OrderByDescending(p => p.EffectiveDate)
                    .FirstOrDefaultAsync();

                if (currentPayroll != null)
                {
                    decimal oldCtc = increment.PreviousCTC;
                    decimal currentCtc = increment.NewCTC;
                    
                    if (currentCtc > 0)
                    {
                        decimal currentGross = currentPayroll.GrossSalary;
                        decimal oldGross = currentGross - increment.IncrementAmount;
                        decimal ratio = currentGross > 0 ? oldGross / currentGross : 0;

                        currentPayroll.CtcAmount = oldCtc;
                        currentPayroll.BasicSalary = Math.Round(currentPayroll.BasicSalary * ratio, 2);
                        currentPayroll.MonthlyBasicPay = currentPayroll.MonthlyBasicPay != null ? Math.Round(currentPayroll.MonthlyBasicPay.Value * ratio, 2) : null;
                        currentPayroll.Hra = Math.Round(currentPayroll.Hra * ratio, 2);
                        currentPayroll.Da = Math.Round(currentPayroll.Da * ratio, 2);
                        currentPayroll.Lta = Math.Round(currentPayroll.Lta * ratio, 2);
                        currentPayroll.SpecialAllowance = Math.Round(currentPayroll.SpecialAllowance * ratio, 2);
                        currentPayroll.PerformanceBonus = Math.Round(currentPayroll.PerformanceBonus * ratio, 2);
                        currentPayroll.GrossSalary = oldGross;
                        currentPayroll.NetAnnualSalary = Math.Round(currentPayroll.NetAnnualSalary * ratio, 2);
                        currentPayroll.NetMonthlyPayable = Math.Round(currentPayroll.NetMonthlyPayable * ratio, 2);
                        
                        // Recalculate EPF based on old basic
                        if (currentPayroll.EpfApplicable)
                        {
                            currentPayroll.EPFEmployee = Math.Round(Math.Min(currentPayroll.BasicSalary * 0.12m, 1800m), 2);
                        }
                        else
                        {
                            currentPayroll.EPFEmployee = 0;
                        }

                        if (increment.PreviousEffectiveDate.HasValue)
                        {
                            currentPayroll.EffectiveDate = increment.PreviousEffectiveDate.Value;
                        }

                        currentPayroll.HourlyRate = currentPayroll.HourlyRate != null ? currentPayroll.HourlyRate * ratio : null;
                    }
                }
            }

            _context.EmpIncrements.Remove(increment);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Payroll",
                "Rollback Increment",
                $"Rolled back and deleted increment ID {id} for employee ID {increment.EmpID}",
                increment.EmpID.ToString(),
                oldIncrementData,
                null
            );

            return Ok(new { Message = "Increment rolled back and deleted successfully." });
        }

        // POST: api/EmpIncrements/BulkRollback
        [HttpPost("BulkRollback")]
        public async Task<IActionResult> BulkRollback([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any()) return BadRequest("No IDs provided");

            var increments = await _context.EmpIncrements
                .Where(i => ids.Contains(i.IncrementID))
                .ToListAsync();

            if (!increments.Any()) return Ok(new { Message = "No increments found to rollback." });

            var oldDataList = new List<string>();

            foreach (var increment in increments)
            {
                oldDataList.Add(System.Text.Json.JsonSerializer.Serialize(increment));

                if (increment.IsProcessed)
                {
                    var currentPayroll = await _context.EmpCTCandPayrolls
                        .Where(p => p.EmpID == increment.EmpID)
                        .OrderByDescending(p => p.EffectiveDate)
                        .FirstOrDefaultAsync();

                    if (currentPayroll != null)
                    {
                        decimal oldCtc = increment.PreviousCTC;
                        decimal currentCtc = increment.NewCTC;

                        if (currentCtc > 0)
                        {
                            decimal currentGross = currentPayroll.GrossSalary;
                            decimal oldGross = currentGross - increment.IncrementAmount;
                            decimal ratio = currentGross > 0 ? oldGross / currentGross : 0;

                            currentPayroll.CtcAmount = oldCtc;
                            currentPayroll.BasicSalary = Math.Round(currentPayroll.BasicSalary * ratio, 2);
                            currentPayroll.Hra = Math.Round(currentPayroll.Hra * ratio, 2);
                            currentPayroll.Da = Math.Round(currentPayroll.Da * ratio, 2);
                            currentPayroll.Lta = Math.Round(currentPayroll.Lta * ratio, 2);
                            currentPayroll.SpecialAllowance = Math.Round(currentPayroll.SpecialAllowance * ratio, 2);
                            currentPayroll.PerformanceBonus = Math.Round(currentPayroll.PerformanceBonus * ratio, 2);
                            currentPayroll.GrossSalary = oldGross;
                            currentPayroll.NetAnnualSalary = Math.Round(currentPayroll.NetAnnualSalary * ratio, 2);
                            currentPayroll.NetMonthlyPayable = Math.Round(currentPayroll.NetMonthlyPayable * ratio, 2);

                            if (currentPayroll.EpfApplicable)
                            {
                                currentPayroll.EPFEmployee = Math.Round(Math.Min(currentPayroll.BasicSalary * 0.12m, 1800m), 2);
                            }
                            else
                            {
                                currentPayroll.EPFEmployee = 0;
                            }

                            currentPayroll.HourlyRate = currentPayroll.HourlyRate != null ? currentPayroll.HourlyRate * ratio : null;
                        }
                    }
                }
            }

            _context.EmpIncrements.RemoveRange(increments);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Bulk Rollback Increments",
                $"Rolled back {increments.Count} increments",
                "all",
                null,
                System.Text.Json.JsonSerializer.Serialize(increments)
            );

            return Ok(new { Message = $"{increments.Count} increments rolled back and deleted successfully." });
        }
    }
}
