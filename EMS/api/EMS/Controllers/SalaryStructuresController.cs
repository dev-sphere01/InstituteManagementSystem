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
    public class SalaryStructuresController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public SalaryStructuresController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/SalaryStructures
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSalaryStructures()
        {
            var data = await (from s in _context.SalaryStructures
                              join p in _context.Positions on s.PositionID equals p.PositionID
                              join d in _context.Departments on p.DeptID equals d.DeptID
                              select new
                              {
                                  Department = d.DeptName,
                                  Position = p.PositionName,
                                  s.MinCTC,
                                  s.MaxCTC,
                                  s.AverageCTC
                              }).ToListAsync();

            return Ok(data);
        }

        // GET: api/SalaryStructures/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalaryStructure>> GetSalaryStructure(int id)
        {
            var salaryStructure = await _context.SalaryStructures.FindAsync(id);

            if (salaryStructure == null)
            {
                return NotFound();
            }

            return salaryStructure;
        }

        // PUT: api/SalaryStructures/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSalaryStructure(int id, SalaryStructure salaryStructure)
        {
            if (id != salaryStructure.SalaryStructureID)
            {
                return BadRequest();
            }

            _context.Entry(salaryStructure).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SalaryStructureExists(id))
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

        // POST: api/SalaryStructures
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SalaryStructure>> PostSalaryStructure(SalaryStructure salaryStructure)
        {
            _context.SalaryStructures.Add(salaryStructure);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSalaryStructure", new { id = salaryStructure.SalaryStructureID }, salaryStructure);
        }

        // DELETE: api/SalaryStructures/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSalaryStructure(int id)
        {
            var salaryStructure = await _context.SalaryStructures.FindAsync(id);
            if (salaryStructure == null)
            {
                return NotFound();
            }

            _context.SalaryStructures.Remove(salaryStructure);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SalaryStructureExists(int id)
        {
            return _context.SalaryStructures.Any(e => e.SalaryStructureID == id);
        }
    }
}
