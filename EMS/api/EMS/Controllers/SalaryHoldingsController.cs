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
    public class SalaryHoldingsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public SalaryHoldingsController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/SalaryHoldings?empId=&status=&month=&year=&locationId=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? empId,
            [FromQuery] string? status,
            [FromQuery] int? month,
            [FromQuery] int? year,
            [FromQuery] int? locationId)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var query = _context.SalaryHoldings.Include(h => h.Employee).AsQueryable();

            if (empId.HasValue) query = query.Where(h => h.EmpID == empId.Value);
            if (!string.IsNullOrEmpty(status)) query = query.Where(h => h.Status == status);
            if (month.HasValue) query = query.Where(h => h.Month == month.Value);
            if (year.HasValue) query = query.Where(h => h.Year == year.Value);

            return Ok(await query.OrderByDescending(h => h.CreatedAt).ToListAsync());
        }

        /// <summary>POST /api/SalaryHoldings — create new holding</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalaryHolding dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            dto.Status = "Active";
            dto.CreatedByImsId = ImsClaimsHelper.GetImsUserId(User);
            dto.CreatedAt = DateTime.UtcNow;
            _context.SalaryHoldings.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { empId = dto.EmpID }, dto);
        }

        /// <summary>PATCH /api/SalaryHoldings/{id}/release</summary>
        [HttpPatch("{id:int}/release")]
        public async Task<IActionResult> Release(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            var holding = await _context.SalaryHoldings.FindAsync(id);
            if (holding == null) return NotFound();
            if (holding.Status != "Active")
                return BadRequest($"Holding is already {holding.Status}.");

            holding.Status = "Released";
            holding.ReleasedAt = DateTime.UtcNow;
            holding.ReleasedByImsId = ImsClaimsHelper.GetImsUserId(User);
            await _context.SaveChangesAsync();
            return Ok(holding);
        }

        /// <summary>PATCH /api/SalaryHoldings/{id}/cancel</summary>
        [HttpPatch("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            var holding = await _context.SalaryHoldings.FindAsync(id);
            if (holding == null) return NotFound();
            if (holding.Status != "Active")
                return BadRequest($"Holding is already {holding.Status}.");

            holding.Status = "Cancelled";
            holding.ReleasedAt = DateTime.UtcNow;
            holding.ReleasedByImsId = ImsClaimsHelper.GetImsUserId(User);
            await _context.SaveChangesAsync();
            return Ok(holding);
        }

        /// <summary>PATCH /api/SalaryHoldings/{id}/reduce — reduce holding amount</summary>
        [HttpPatch("{id:int}/reduce")]
        public async Task<IActionResult> Reduce(int id, [FromBody] ReduceHoldingDto dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            var holding = await _context.SalaryHoldings.FindAsync(id);
            if (holding == null) return NotFound();
            if (holding.Status != "Active")
                return BadRequest($"Cannot reduce a {holding.Status} holding.");
            if (dto.NewAmount >= holding.Amount)
                return BadRequest("New amount must be less than current amount.");
            if (dto.NewAmount < 0)
                return BadRequest("Amount cannot be negative.");

            holding.Amount = dto.NewAmount;
            holding.Status = "Reduced";
            await _context.SaveChangesAsync();
            return Ok(holding);
        }
    }

    public class ReduceHoldingDto
    {
        public decimal NewAmount { get; set; }
    }
}
