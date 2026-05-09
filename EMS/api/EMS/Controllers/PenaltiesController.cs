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
    public class PenaltiesController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public PenaltiesController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Penalties
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Penalty>>> GetPenalties()
        {
            return await _context.Penalties.ToListAsync();
        }

        // GET: api/Penalties/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Penalty>> GetPenalty(int id)
        {
            var penalty = await _context.Penalties.FindAsync(id);

            if (penalty == null)
            {
                return NotFound();
            }

            return penalty;
        }

        // PUT: api/Penalties/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPenalty(int id, Penalty penalty)
        {
            if (id != penalty.PID)
            {
                return BadRequest();
            }

            var oldPenalty = await _context.Penalties.AsNoTracking().FirstOrDefaultAsync(p => p.PID == id);
            if (oldPenalty == null) return NotFound();

            _context.Entry(penalty).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Payroll",
                    "Update Penalty",
                    $"Updated penalty {id} for employee {penalty.EmpID}",
                    penalty.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldPenalty),
                    System.Text.Json.JsonSerializer.Serialize(penalty)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PenaltyExists(id))
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

        // POST: api/Penalties
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Penalty>> PostPenalty(Penalty penalty)
        {
            _context.Penalties.Add(penalty);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Assign Penalty",
                $"Assigned penalty to employee {penalty.EmpID}. Amount: {penalty.Amount}",
                penalty.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(penalty)
            );

            return CreatedAtAction("GetPenalty", new { id = penalty.PID }, penalty);
        }

        // DELETE: api/Penalties/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePenalty(int id)
        {
            var penalty = await _context.Penalties.FindAsync(id);
            if (penalty == null)
            {
                return NotFound();
            }

            _context.Penalties.Remove(penalty);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Delete Penalty",
                $"Deleted penalty {id} for employee {penalty.EmpID}",
                penalty.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(penalty),
                null
            );

            return NoContent();
        }

        private bool PenaltyExists(int id)
        {
            return _context.Penalties.Any(e => e.PID == id);
        }
    }
}
