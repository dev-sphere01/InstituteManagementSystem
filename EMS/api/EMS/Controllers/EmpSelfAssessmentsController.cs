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
    public class EmpSelfAssessmentsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpSelfAssessmentsController(EMSDbContext context, Services.IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpSelfAssessments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpSelfAssessment>>> GetEmpSelfAssessments()
        {
            return await _context.EmpSelfAssessments.ToListAsync();
        }

        // GET: api/EmpSelfAssessments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpSelfAssessment>> GetEmpSelfAssessment(int id)
        {
            var empSelfAssessment = await _context.EmpSelfAssessments.FindAsync(id);

            if (empSelfAssessment == null)
            {
                return NotFound();
            }

            return empSelfAssessment;
        }

        // PUT: api/EmpSelfAssessments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpSelfAssessment(int id, EmpSelfAssessment empSelfAssessment)
        {
            if (id != empSelfAssessment.ESAID)
            {
                return BadRequest();
            }

            var oldAssessment = await _context.EmpSelfAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.ESAID == id);
            _context.Entry(empSelfAssessment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                await _logger.LogActivityAsync(
                    "Performance",
                    "Update Self Assessment",
                    $"Updated self assessment for employee ID {empSelfAssessment.EmpID}",
                    empSelfAssessment.EmpID?.ToString() ?? "unknown",
                    System.Text.Json.JsonSerializer.Serialize(oldAssessment),
                    System.Text.Json.JsonSerializer.Serialize(empSelfAssessment)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpSelfAssessmentExists(id))
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

        // POST: api/EmpSelfAssessments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpSelfAssessment>> PostEmpSelfAssessment(EmpSelfAssessment empSelfAssessment)
        {
            _context.EmpSelfAssessments.Add(empSelfAssessment);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Performance",
                "Create Self Assessment",
                $"Created new self assessment for employee ID {empSelfAssessment.EmpID}",
                empSelfAssessment.EmpID?.ToString() ?? "unknown",
                null,
                System.Text.Json.JsonSerializer.Serialize(empSelfAssessment)
            );

            return CreatedAtAction("GetEmpSelfAssessment", new { id = empSelfAssessment.ESAID }, empSelfAssessment);
        }

        // DELETE: api/EmpSelfAssessments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpSelfAssessment(int id)
        {
            var empSelfAssessment = await _context.EmpSelfAssessments.FindAsync(id);
            if (empSelfAssessment == null)
            {
                return NotFound();
            }

            _context.EmpSelfAssessments.Remove(empSelfAssessment);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Performance",
                "Delete Self Assessment",
                $"Deleted self assessment ID {id} for employee ID {empSelfAssessment.EmpID}",
                empSelfAssessment.EmpID?.ToString() ?? "unknown",
                System.Text.Json.JsonSerializer.Serialize(empSelfAssessment),
                null
            );

            return NoContent();
        }

        private bool EmpSelfAssessmentExists(int id)
        {
            return _context.EmpSelfAssessments.Any(e => e.ESAID == id);
        }
    }
}
