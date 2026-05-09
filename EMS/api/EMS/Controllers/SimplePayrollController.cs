using EMS.Data;
using EMS.Helpers;
using EMS.Models;
using EMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SimplePayrollController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly SimplePayrollService _payrollService;

        public SimplePayrollController(EMSDbContext context, SimplePayrollService payrollService)
        {
            _context = context;
            _payrollService = payrollService;
        }

        /// <summary>
        /// POST /api/SimplePayroll/process
        /// Process payroll for all active employees in a branch for a given month/year.
        /// </summary>
        [HttpPost("process")]
        public async Task<IActionResult> ProcessBranch([FromBody] ProcessPayrollDto dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.process"))
                return Forbid();

            var imsUserId = ImsClaimsHelper.GetImsUserId(User);
            var (success, failed, errors) = await _payrollService.ProcessBranchPayroll(
                dto.LocationId, dto.Month, dto.Year, imsUserId);

            return Ok(new { Success = success, Failed = failed, Errors = errors });
        }

        /// <summary>GET /api/SimplePayroll?locationId=&month=&year=&status=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? locationId,
            [FromQuery] int? month,
            [FromQuery] int? year,
            [FromQuery] string? status)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var query = _context.SimplePayrolls
                .Include(p => p.Employee)
                .AsQueryable();

            if (month.HasValue) query = query.Where(p => p.Month == month.Value);
            if (year.HasValue) query = query.Where(p => p.Year == year.Value);
            if (!string.IsNullOrEmpty(status)) query = query.Where(p => p.Status == status);

            if (locationId.HasValue)
            {
                var empIds = await _context.Employees
                    .Where(e => e.LocationID == locationId.Value)
                    .Select(e => e.EmpID)
                    .ToListAsync();
                query = query.Where(p => empIds.Contains(p.EmpID));
            }

            return Ok(await query.OrderBy(p => p.EmpID).ToListAsync());
        }

        /// <summary>GET /api/SimplePayroll/{id}</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var payroll = await _context.SimplePayrolls
                .Include(p => p.Employee)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payroll == null) return NotFound();
            return Ok(payroll);
        }

        /// <summary>PATCH /api/SimplePayroll/{id}/approve — approve a processed payroll record</summary>
        [HttpPatch("{id:int}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.approve"))
                return Forbid();

            var payroll = await _context.SimplePayrolls.FindAsync(id);
            if (payroll == null) return NotFound();
            if (payroll.Status == "Approved")
                return BadRequest("Payroll already approved.");
            if (payroll.Status == "Draft")
                return BadRequest("Cannot approve a Draft payroll — process it first.");

            payroll.Status = "Approved";
            payroll.ApprovedByImsId = ImsClaimsHelper.GetImsUserId(User);
            payroll.ApprovedAt = DateTime.UtcNow;
            payroll.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(payroll);
        }

        /// <summary>
        /// GET /api/SimplePayroll/slip/{empId}?month=&year=
        /// Returns salary slip data for an approved payroll.
        /// </summary>
        [HttpGet("slip/{empId:int}")]
        public async Task<IActionResult> GetSalarySlip(int empId, [FromQuery] int month, [FromQuery] int year)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var payroll = await _context.SimplePayrolls
                .Include(p => p.Employee)
                .FirstOrDefaultAsync(p => p.EmpID == empId && p.Month == month && p.Year == year);

            if (payroll == null)
                return NotFound("No payroll record found for the given employee and period.");
            if (payroll.Status != "Approved")
                return BadRequest("Salary slip is only available for approved payrolls.");

            // Get incentives for the period
            var incentives = await _context.IncentiveRecords
                .Where(i => i.EmpID == empId && i.Month == month && i.Year == year)
                .ToListAsync();

            return Ok(new { Payroll = payroll, Incentives = incentives });
        }
    }

    public class ProcessPayrollDto
    {
        public int LocationId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }
}
