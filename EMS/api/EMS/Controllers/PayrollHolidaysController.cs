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
    public class PayrollHolidaysController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public PayrollHolidaysController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/PayrollHolidays?locationId=&month=&year=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? locationId, [FromQuery] int? month, [FromQuery] int? year)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.read"))
                return Forbid();

            var query = _context.PayrollHolidays.AsQueryable();

            if (locationId.HasValue)
                query = query.Where(h => h.LocationId == locationId.Value);
            if (month.HasValue)
                query = query.Where(h => h.Date.Month == month.Value);
            if (year.HasValue)
                query = query.Where(h => h.Date.Year == year.Value);

            var holidays = await query.OrderBy(h => h.Date).ToListAsync();
            return Ok(holidays);
        }

        /// <summary>POST /api/PayrollHolidays</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PayrollHoliday dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.create"))
                return Forbid();

            // Check duplicate Date + LocationId
            var exists = await _context.PayrollHolidays
                .AnyAsync(h => h.Date == dto.Date && h.LocationId == dto.LocationId);
            if (exists)
                return Conflict("A holiday on this date for this branch already exists.");

            dto.CreatedByImsId = ImsClaimsHelper.GetImsUserId(User);
            dto.CreatedAt = DateTime.UtcNow;
            _context.PayrollHolidays.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { locationId = dto.LocationId }, dto);
        }

        /// <summary>PUT /api/PayrollHolidays/{id}</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PayrollHoliday dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.update"))
                return Forbid();

            var existing = await _context.PayrollHolidays.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Date = dto.Date;
            existing.Name = dto.Name;
            existing.IsWorkingDay = dto.IsWorkingDay;
            _context.PayrollHolidays.Update(existing);
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        /// <summary>DELETE /api/PayrollHolidays/{id}</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.update"))
                return Forbid();

            var existing = await _context.PayrollHolidays.FindAsync(id);
            if (existing == null) return NotFound();

            _context.PayrollHolidays.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
