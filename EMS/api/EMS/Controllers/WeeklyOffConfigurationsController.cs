using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeeklyOffConfigurationsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public WeeklyOffConfigurationsController(EMSDbContext context)
        {
            _context = context;
        }

        [HttpGet("{empId}")]
        public async Task<ActionResult<IEnumerable<WeeklyOffConfiguration>>> GetWeeklyOffConfigurations(int empId)
        {
            var configs = await _context.WeeklyOffConfigurations
                .Where(w => w.EmpID == empId && w.IsActive)
                .ToListAsync();

            return Ok(configs);
        }

        [HttpGet("active/{empId}/{date}")]
        public async Task<ActionResult<WeeklyOffConfiguration>> GetActiveWeeklyOffConfiguration(int empId, string date)
        {
            if (!DateTime.TryParse(date, out var checkDate))
                return BadRequest("Invalid date format");

            var config = await _context.WeeklyOffConfigurations
                .FirstOrDefaultAsync(w => w.EmpID == empId && 
                                         w.IsActive &&
                                         w.EffectiveDate <= checkDate && 
                                         (w.EndDate == null || w.EndDate >= checkDate));

            if (config == null)
                return NotFound("No active weekly off configuration found");

            return Ok(config);
        }

        [HttpPost]
        public async Task<ActionResult<WeeklyOffConfiguration>> CreateWeeklyOffConfiguration(
            [FromBody] WeeklyOffConfiguration config)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var validDays = new[] { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
            if (!validDays.Contains(config.DayOfWeek))
                return BadRequest("Invalid day of week");

            var employee = await _context.Employees.FindAsync(config.EmpID);
            if (employee == null)
                return NotFound("Employee not found");

            var existingConfig = await _context.WeeklyOffConfigurations
                .FirstOrDefaultAsync(w => w.EmpID == config.EmpID && 
                                         w.IsActive &&
                                         w.EffectiveDate <= config.EffectiveDate && 
                                         (w.EndDate == null || w.EndDate >= config.EffectiveDate));

            if (existingConfig != null)
            {
                existingConfig.EndDate = config.EffectiveDate.AddDays(-1);
                existingConfig.IsActive = false;
            }

            config.CreatedAt = DateTime.UtcNow;
            config.IsActive = true;

            _context.WeeklyOffConfigurations.Add(config);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetActiveWeeklyOffConfiguration), 
                new { empId = config.EmpID, date = config.EffectiveDate.ToString("yyyy-MM-dd") }, config);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWeeklyOffConfiguration(int id, 
            [FromBody] WeeklyOffConfiguration config)
        {
            if (id != config.WeeklyOffConfigID)
                return BadRequest();

            var existingConfig = await _context.WeeklyOffConfigurations.FindAsync(id);
            if (existingConfig == null)
                return NotFound();

            var validDays = new[] { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
            if (!validDays.Contains(config.DayOfWeek))
                return BadRequest("Invalid day of week");

            existingConfig.DayOfWeek = config.DayOfWeek;
            existingConfig.EndDate = config.EndDate;
            existingConfig.IsActive = config.IsActive;

            _context.Entry(existingConfig).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWeeklyOffConfiguration(int id)
        {
            var config = await _context.WeeklyOffConfigurations.FindAsync(id);
            if (config == null)
                return NotFound();

            config.IsActive = false;
            config.EndDate = DateTime.UtcNow;
            _context.Entry(config).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("batch")]
        public async Task<ActionResult<IEnumerable<WeeklyOffConfiguration>>> CreateBatchWeeklyOffConfigurations(
            [FromBody] List<WeeklyOffConfiguration> configs)
        {
            if (!configs.Any())
                return BadRequest("No configurations provided");

            var validDays = new[] { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

            foreach (var config in configs)
            {
                if (!validDays.Contains(config.DayOfWeek))
                    return BadRequest($"Invalid day of week: {config.DayOfWeek}");

                var employee = await _context.Employees.FindAsync(config.EmpID);
                if (employee == null)
                    return NotFound($"Employee {config.EmpID} not found");

                config.CreatedAt = DateTime.UtcNow;
                config.IsActive = true;
            }

            _context.WeeklyOffConfigurations.AddRange(configs);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWeeklyOffConfigurations), configs);
        }
    }
}
