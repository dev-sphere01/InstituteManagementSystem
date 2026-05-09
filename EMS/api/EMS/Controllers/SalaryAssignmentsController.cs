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
    public class SalaryAssignmentsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly SimplePayrollService _payrollService;

        public SalaryAssignmentsController(EMSDbContext context, SimplePayrollService payrollService)
        {
            _context = context;
            _payrollService = payrollService;
        }

        /// <summary>GET /api/SalaryAssignments/{empId} — history for one employee</summary>
        [HttpGet("{empId:int}")]
        public async Task<IActionResult> GetByEmployee(int empId)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var assignments = await _context.SalaryAssignments
                .Where(s => s.EmpID == empId)
                .OrderByDescending(s => s.EffectiveDate)
                .ToListAsync();

            return Ok(assignments);
        }

        /// <summary>POST /api/SalaryAssignments — assign/update salary</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalaryAssignment dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            var imsUserId = ImsClaimsHelper.GetImsUserId(User);

            // Deactivate existing active assignment for this employee
            var existing = await _context.SalaryAssignments
                .Where(s => s.EmpID == dto.EmpID && s.IsActive)
                .ToListAsync();
            foreach (var s in existing) s.IsActive = false;

            dto.IsActive = true;
            dto.CreatedByImsId = imsUserId;
            dto.CreatedAt = DateTime.UtcNow;
            _context.SalaryAssignments.Add(dto);
            await _context.SaveChangesAsync();

            // Auto-create joining hold if this is the first salary assignment
            var isFirst = await _context.SalaryAssignments
                .CountAsync(s => s.EmpID == dto.EmpID) == 1;
            if (isFirst)
                await _payrollService.CreateJoiningHoldIfRequired(dto.EmpID, dto.MonthlySalary, imsUserId);

            return CreatedAtAction(nameof(GetByEmployee), new { empId = dto.EmpID }, dto);
        }
    }
}
