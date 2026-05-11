using EMS.Data;
using EMS.Helpers;
using EMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LateFineRulesController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public LateFineRulesController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/LateFineRules/{locationId}</summary>
        [HttpGet("{locationId:int}")]
        public async Task<IActionResult> Get(int locationId)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.read"))
                return Forbid();

            var rule = await _context.LateFineRules
                .FirstOrDefaultAsync(r => r.LocationId == locationId);

            if (rule == null)
                return Ok(new { LocationId = locationId, Slabs = new List<FineSlab>() });

            var slabs = string.IsNullOrEmpty(rule.SlabsJson)
                ? new List<FineSlab>()
                : JsonSerializer.Deserialize<List<FineSlab>>(rule.SlabsJson) ?? new List<FineSlab>();

            return Ok(new { rule.Id, rule.LocationId, Slabs = slabs, rule.UpdatedAt });
        }

        /// <summary>PUT /api/LateFineRules/{locationId} — upsert slabs</summary>
        [HttpPut("{locationId:int}")]
        public async Task<IActionResult> Upsert(int locationId, [FromBody] SlabsUpdateDto dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "attendance.update"))
                return Forbid();

            var slabsJson = JsonSerializer.Serialize(dto.Slabs ?? new List<FineSlab>());

            var existing = await _context.LateFineRules
                .FirstOrDefaultAsync(r => r.LocationId == locationId);

            if (existing == null)
            {
                var newRule = new LateFineRule
                {
                    LocationId = locationId,
                    SlabsJson = slabsJson,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.LateFineRules.Add(newRule);
                await _context.SaveChangesAsync();
                return Ok(newRule);
            }
            else
            {
                existing.SlabsJson = slabsJson;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.LateFineRules.Update(existing);
                await _context.SaveChangesAsync();
                return Ok(existing);
            }
        }
    }

    public class SlabsUpdateDto
    {
        public List<FineSlab>? Slabs { get; set; }
    }
}
