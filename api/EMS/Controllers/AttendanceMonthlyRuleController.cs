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
    public class AttendanceMonthlyRuleController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public AttendanceMonthlyRuleController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/AttendanceMonthlyRule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceMonthlyRule>>> GetAttendanceMonthlyRules()
        {
            return await _context.AttendanceMonthlyRules.ToListAsync();
        }

        // GET: api/AttendanceMonthlyRule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AttendanceMonthlyRule>> GetAttendanceMonthlyRule(int id)
        {
            var attendanceMonthlyRule = await _context.AttendanceMonthlyRules.FindAsync(id);

            if (attendanceMonthlyRule == null)
            {
                return NotFound();
            }

            return attendanceMonthlyRule;
        }

        // PUT: api/AttendanceMonthlyRule/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAttendanceMonthlyRule(int id, AttendanceMonthlyRule attendanceMonthlyRule)
        {
            if (id != attendanceMonthlyRule.RuleID)
            {
                return BadRequest();
            }

            _context.Entry(attendanceMonthlyRule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttendanceMonthlyRuleExists(id))
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

        // POST: api/AttendanceMonthlyRule
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AttendanceMonthlyRule>> PostAttendanceMonthlyRule(AttendanceMonthlyRule attendanceMonthlyRule)
        {
            _context.AttendanceMonthlyRules.Add(attendanceMonthlyRule);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAttendanceMonthlyRule", new { id = attendanceMonthlyRule.RuleID }, attendanceMonthlyRule);
        }

        // DELETE: api/AttendanceMonthlyRule/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttendanceMonthlyRule(int id)
        {
            var attendanceMonthlyRule = await _context.AttendanceMonthlyRules.FindAsync(id);
            if (attendanceMonthlyRule == null)
            {
                return NotFound();
            }

            _context.AttendanceMonthlyRules.Remove(attendanceMonthlyRule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AttendanceMonthlyRuleExists(int id)
        {
            return _context.AttendanceMonthlyRules.Any(e => e.RuleID == id);
        }
    }
}
