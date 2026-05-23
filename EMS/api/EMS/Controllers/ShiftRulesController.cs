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
    public class ShiftRulesController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public ShiftRulesController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/ShiftRules/{locationId}</summary>
        [HttpGet("{locationId:int}")]
        public async Task<IActionResult> Get(int locationId)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.read"))
                return Forbid();

            var rule = await _context.ShiftRules
                .FirstOrDefaultAsync(r => r.LocationId == locationId);

            if (rule == null)
                return Ok(new ShiftRule
                {
                    LocationId = locationId,
                    ShiftName = "Morning",
                    ShiftStart = "10:00",
                    GracePeriodMins = 0,
                    LateThresholdMins = 15,
                    HalfDayThresholdMins = 60
                });

            return Ok(rule);
        }

        /// <summary>PUT /api/ShiftRules/{locationId} — upsert</summary>
        [HttpPut("{locationId:int}")]
        public async Task<IActionResult> Upsert(int locationId, [FromBody] ShiftRule dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.update"))
                return Forbid();

            var existing = await _context.ShiftRules
                .FirstOrDefaultAsync(r => r.LocationId == locationId);

            if (existing == null)
            {
                dto.LocationId = locationId;
                dto.UpdatedAt = DateTime.UtcNow;
                _context.ShiftRules.Add(dto);
            }
            else
            {
                existing.ShiftName = dto.ShiftName;
                existing.ShiftStart = dto.ShiftStart;
                existing.GracePeriodMins = dto.GracePeriodMins;
                existing.LateThresholdMins = dto.LateThresholdMins;
                existing.HalfDayThresholdMins = dto.HalfDayThresholdMins;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.ShiftRules.Update(existing);
            }

            await _context.SaveChangesAsync();
            return Ok(existing ?? dto);
        }
    }
}
