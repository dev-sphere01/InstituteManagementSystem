using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using EMS.Services;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OtherAllowancesController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public OtherAllowancesController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/OtherAllowances
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OtherAllowance>>> GetOtherAllowances()
        {
            return await _context.OtherAllowances.ToListAsync();
        }

        // GET: api/OtherAllowances/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OtherAllowance>> GetOtherAllowance(int id)
        {
            var otherAllowance = await _context.OtherAllowances.FindAsync(id);

            if (otherAllowance == null)
            {
                return NotFound();
            }

            return otherAllowance;
        }

        // PUT: api/OtherAllowances/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOtherAllowance(int id, OtherAllowance otherAllowance)
        {
            if (id != otherAllowance.OAID)
            {
                return BadRequest();
            }

            var oldAllowance = await _context.OtherAllowances.AsNoTracking().FirstOrDefaultAsync(a => a.OAID == id);
            if (oldAllowance == null) return NotFound();

            _context.Entry(otherAllowance).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Payroll",
                    "Update Other Allowance",
                    $"Updated allowance {id} for employee {otherAllowance.EmpID}",
                    otherAllowance.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldAllowance),
                    System.Text.Json.JsonSerializer.Serialize(otherAllowance)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OtherAllowanceExists(id))
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

        // POST: api/OtherAllowances
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<OtherAllowance>> PostOtherAllowance(OtherAllowance otherAllowance)
        {
            _context.OtherAllowances.Add(otherAllowance);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Assign Other Allowance",
                $"Assigned other allowance to employee {otherAllowance.EmpID}. Amount: {otherAllowance.Amount}",
                otherAllowance.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(otherAllowance)
            );

            return CreatedAtAction("GetOtherAllowance", new { id = otherAllowance.OAID }, otherAllowance);
        }

        // DELETE: api/OtherAllowances/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOtherAllowance(int id)
        {
            var otherAllowance = await _context.OtherAllowances.FindAsync(id);
            if (otherAllowance == null)
            {
                return NotFound();
            }

            _context.OtherAllowances.Remove(otherAllowance);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Delete Other Allowance",
                $"Deleted other allowance {id} for employee {otherAllowance.EmpID}",
                otherAllowance.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(otherAllowance),
                null
            );

            return NoContent();
        }

        private bool OtherAllowanceExists(int id)
        {
            return _context.OtherAllowances.Any(e => e.OAID == id);
        }
    }
}
