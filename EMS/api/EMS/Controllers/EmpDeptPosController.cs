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
    public class EmpDeptPosController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpDeptPosController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpDeptPos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpDeptPos>>> GetEmpDeptPositions()
        {
            return await _context.EmpDeptPositions.ToListAsync();
        }

        // GET: api/EmpDeptPos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpDeptPos>> GetEmpDeptPos(int id)
        {
            var empDeptPos = await _context.EmpDeptPositions.FirstOrDefaultAsync(edp => edp.EmpID == id);

            if (empDeptPos == null)
            {
                return NotFound();
            }

            return empDeptPos;
        }

        // PUT: api/EmpDeptPos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpDeptPos(int id, EmpDeptPos empDeptPos)
        {
            if (id != empDeptPos.EdpID)
            {
                return BadRequest();
            }

            var oldMapping = await _context.EmpDeptPositions.AsNoTracking().FirstOrDefaultAsync(m => m.EdpID == id);
            if (oldMapping == null) return NotFound();

            _context.Entry(empDeptPos).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Dept/Pos mapping",
                    $"Updated department/position mapping {id} for employee {empDeptPos.EmpID}",
                    empDeptPos.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldMapping),
                    System.Text.Json.JsonSerializer.Serialize(empDeptPos)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpDeptPosExists(id))
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

        // POST: api/EmpDeptPos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpDeptPos>> PostEmpDeptPos(EmpDeptPos empDeptPos)
        {
            _context.EmpDeptPositions.Add(empDeptPos);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Dept/Pos mapping",
                $"Created department/position mapping for employee {empDeptPos.EmpID}",
                empDeptPos.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(empDeptPos)
            );

            return CreatedAtAction("GetEmpDeptPos", new { id = empDeptPos.EdpID }, empDeptPos);
        }

        // DELETE: api/EmpDeptPos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpDeptPos(int id)
        {
            var empDeptPos = await _context.EmpDeptPositions.FindAsync(id);
            if (empDeptPos == null)
            {
                return NotFound();
            }

            _context.EmpDeptPositions.Remove(empDeptPos);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Dept/Pos mapping",
                $"Deleted department/position mapping {id} for employee {empDeptPos.EmpID}",
                empDeptPos.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empDeptPos),
                null
            );

            return NoContent();
        }

        private bool EmpDeptPosExists(int id)
        {
            return _context.EmpDeptPositions.Any(e => e.EdpID == id);
        }
    }
}
