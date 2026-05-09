using EMS.Data;
using EMS.Helpers;
using EMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeFinesController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public EmployeeFinesController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/EmployeeFines?empId=&month=&year=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? empId, [FromQuery] int? month, [FromQuery] int? year)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var query = _context.EmployeeFines.AsQueryable();

            if (empId.HasValue) query = query.Where(f => f.EmpID == empId.Value);
            if (month.HasValue) query = query.Where(f => f.Month == month.Value);
            if (year.HasValue) query = query.Where(f => f.Year == year.Value);

            return Ok(await query.OrderByDescending(f => f.CreatedAt).ToListAsync());
        }

        /// <summary>POST /api/EmployeeFines — add manual fine</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeFine dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            dto.FineType = "Manual"; // frontend can only create manual fines
            dto.CreatedByImsId = ImsClaimsHelper.GetImsUserId(User);
            dto.CreatedAt = DateTime.UtcNow;
            _context.EmployeeFines.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { empId = dto.EmpID }, dto);
        }

        /// <summary>DELETE /api/EmployeeFines/{id}</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            var fine = await _context.EmployeeFines.FindAsync(id);
            if (fine == null) return NotFound();
            if (fine.FineType == "AutoLate")
                return BadRequest("Auto-generated late fines cannot be deleted manually.");

            _context.EmployeeFines.Remove(fine);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
