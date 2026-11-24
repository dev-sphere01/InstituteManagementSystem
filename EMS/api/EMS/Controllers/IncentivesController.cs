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
    public class IncentivesController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public IncentivesController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/Incentives?empId=&month=&year=&locationId=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? empId,
            [FromQuery] int? month,
            [FromQuery] int? year,
            [FromQuery] int? locationId)
        {
            var query = _context.IncentiveRecords.Include(i => i.Employee).AsQueryable();

            if (empId.HasValue) query = query.Where(i => i.EmpID == empId.Value);
            if (month.HasValue) query = query.Where(i => i.Month == month.Value);
            if (year.HasValue) query = query.Where(i => i.Year == year.Value);

            if (locationId.HasValue)
            {
                var empIds = await _context.Employees
                    .Where(e => e.LocationID == locationId.Value)
                    .Select(e => e.EmpID).ToListAsync();
                query = query.Where(i => empIds.Contains(i.EmpID));
            }

            return Ok(await query.OrderByDescending(i => i.CreatedAt).ToListAsync());
        }

        /// <summary>POST /api/Incentives</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IncentiveRecord dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "incentive.create"))
                return Forbid();

            dto.Total = dto.Quantity * dto.Rate;
            dto.CreatedByImsId = ImsClaimsHelper.GetImsUserId(User);
            dto.CreatedAt = DateTime.UtcNow;
            _context.IncentiveRecords.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { empId = dto.EmpID }, dto);
        }

        /// <summary>PUT /api/Incentives/{id}</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] IncentiveRecord dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "incentive.update"))
                return Forbid();

            var existing = await _context.IncentiveRecords.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Program = dto.Program;
            existing.Quantity = dto.Quantity;
            existing.Rate = dto.Rate;
            existing.Total = dto.Quantity * dto.Rate;
            _context.IncentiveRecords.Update(existing);
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        /// <summary>DELETE /api/Incentives/{id}</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "incentive.delete"))
                return Forbid();

            var existing = await _context.IncentiveRecords.FindAsync(id);
            if (existing == null) return NotFound();

            _context.IncentiveRecords.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
