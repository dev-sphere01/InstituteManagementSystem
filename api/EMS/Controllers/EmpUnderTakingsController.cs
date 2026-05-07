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
    public class EmpUnderTakingsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpUnderTakingsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpUnderTakings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpUnderTaking>>> GetEmpUnderTakings()
        {
            return await _context.EmpUnderTakings.ToListAsync();
        }

        // GET: api/EmpUnderTakings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpUnderTaking>> GetEmpUnderTaking(int id)
        {
            var empUnderTaking = await _context.EmpUnderTakings.FindAsync(id);

            if (empUnderTaking == null)
            {
                return NotFound();
            }

            return empUnderTaking;
        }

        // PUT: api/EmpUnderTakings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpUnderTaking(int id, EmpUnderTaking empUnderTaking)
        {
            if (id != empUnderTaking.EmpUnderTakingID)
            {
                return BadRequest();
            }

            var oldDetail = await _context.EmpUnderTakings.AsNoTracking().FirstOrDefaultAsync(u => u.EmpUnderTakingID == id);
            if (oldDetail == null) return NotFound();

            _context.Entry(empUnderTaking).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Undertaking",
                    $"Updated undertaking {id} for employee {empUnderTaking.EmpID}",
                    empUnderTaking.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldDetail),
                    System.Text.Json.JsonSerializer.Serialize(empUnderTaking)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpUnderTakingExists(id))
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

        // POST: api/EmpUnderTakings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpUnderTaking>> PostEmpUnderTaking(EmpUnderTaking empUnderTaking)
        {
            _context.EmpUnderTakings.Add(empUnderTaking);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Undertaking",
                $"Created undertaking for employee {empUnderTaking.EmpID}",
                empUnderTaking.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(empUnderTaking)
            );

            return CreatedAtAction("GetEmpUnderTaking", new { id = empUnderTaking.EmpUnderTakingID }, empUnderTaking);
        }

        // DELETE: api/EmpUnderTakings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpUnderTaking(int id)
        {
            var empUnderTaking = await _context.EmpUnderTakings.FindAsync(id);
            if (empUnderTaking == null)
            {
                return NotFound();
            }

            _context.EmpUnderTakings.Remove(empUnderTaking);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Undertaking",
                $"Deleted undertaking {id} for employee {empUnderTaking.EmpID}",
                empUnderTaking.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empUnderTaking),
                null
            );

            return NoContent();
        }

        private bool EmpUnderTakingExists(int id)
        {
            return _context.EmpUnderTakings.Any(e => e.EmpUnderTakingID == id);
        }
    }
}
