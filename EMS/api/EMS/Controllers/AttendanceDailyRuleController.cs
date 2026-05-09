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
    public class AttendanceDailyRuleController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public AttendanceDailyRuleController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/AttendanceDailyRule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceDailyRule>>> GetAttendanceDailyRules()
        {
            return await _context.AttendanceDailyRules.ToListAsync();
        }

        // GET: api/AttendanceDailyRule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AttendanceDailyRule>> GetAttendanceDailyRule(int id)
        {
            var attendanceDailyRule = await _context.AttendanceDailyRules.FindAsync(id);

            if (attendanceDailyRule == null)
            {
                return NotFound();
            }

            return attendanceDailyRule;
        }

        // PUT: api/AttendanceDailyRule/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAttendanceDailyRule(int id, AttendanceDailyRule attendanceDailyRule)
        {
            if (id != attendanceDailyRule.RuleID)
            {
                return BadRequest();
            }

            _context.Entry(attendanceDailyRule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttendanceDailyRuleExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/AttendanceDailyRule
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AttendanceDailyRule>> PostAttendanceDailyRule(AttendanceDailyRule attendanceDailyRule)
        {
            _context.AttendanceDailyRules.Add(attendanceDailyRule);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAttendanceDailyRule", new { id = attendanceDailyRule.RuleID }, attendanceDailyRule);
        }

        // DELETE: api/AttendanceDailyRule/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttendanceDailyRule(int id)
        {
            var attendanceDailyRule = await _context.AttendanceDailyRules.FindAsync(id);
            if (attendanceDailyRule == null)
            {
                return NotFound();
            }

            _context.AttendanceDailyRules.Remove(attendanceDailyRule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AttendanceDailyRuleExists(int id)
        {
            return _context.AttendanceDailyRules.Any(e => e.RuleID == id);
        }
    }
}
