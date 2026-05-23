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
    public class RandomAssessmentsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public RandomAssessmentsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/RandomAssessments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RandomAssessment>>> GetRandomAssessments()
        {
            return await _context.RandomAssessments.ToListAsync();
        }

        // GET: api/RandomAssessments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RandomAssessment>> GetRandomAssessment(int id)
        {
            var randomAssessment = await _context.RandomAssessments.FindAsync(id);

            if (randomAssessment == null)
            {
                return NotFound();
            }

            return randomAssessment;
        }

        // PUT: api/RandomAssessments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRandomAssessment(int id, RandomAssessment randomAssessment)
        {
            if (id != randomAssessment.RAID)
            {
                return BadRequest();
            }

            _context.Entry(randomAssessment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RandomAssessmentExists(id))
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

        [HttpGet("GetEmployeebyAssessorID")]
        public async Task<ActionResult<RandomAssessment>> GetEmployeebyAssessorID(int id, int sessionID)
        {
            var randomAssessment = await _context.RandomAssessments.Where(ra => ra.AssessorID == id && ra.RSID == sessionID).OrderByDescending(e=>e.RAID).FirstAsync();
            if(randomAssessment == null)
            {
                return BadRequest("No Record Found");
            }
            return Ok(randomAssessment);
        }

        // POST: api/RandomAssessments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<RandomAssessment>> PostRandomAssessment(RandomAssessment randomAssessment)
        {
            _context.RandomAssessments.Add(randomAssessment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRandomAssessment", new { id = randomAssessment.RAID }, randomAssessment);
        }

        // DELETE: api/RandomAssessments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRandomAssessment(int id)
        {
            var randomAssessment = await _context.RandomAssessments.FindAsync(id);
            if (randomAssessment == null)
            {
                return NotFound();
            }

            _context.RandomAssessments.Remove(randomAssessment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RandomAssessmentExists(int id)
        {
            return _context.RandomAssessments.Any(e => e.RAID == id);
        }
    }
}
