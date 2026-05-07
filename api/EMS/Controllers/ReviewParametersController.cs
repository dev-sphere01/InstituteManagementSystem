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
    public class ReviewParametersController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public ReviewParametersController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/ReviewParameters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewParameter>>> GetReviewParameters()
        {
            return await _context.ReviewParameters.ToListAsync();
        }

        // GET: api/ReviewParameters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewParameter>> GetReviewParameter(int id)
        {
            var reviewParameter = await _context.ReviewParameters.FindAsync(id);

            if (reviewParameter == null)
            {
                return NotFound();
            }

            return reviewParameter;
        }

        // PUT: api/ReviewParameters/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReviewParameter(int id, ReviewParameter reviewParameter)
        {
            if (id != reviewParameter.ReviewParameterID)
            {
                return BadRequest();
            }

            _context.Entry(reviewParameter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewParameterExists(id))
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

        // POST: api/ReviewParameters
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ReviewParameter>> PostReviewParameter(ReviewParameter reviewParameter)
        {
            _context.ReviewParameters.Add(reviewParameter);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReviewParameter", new { id = reviewParameter.ReviewParameterID }, reviewParameter);
        }

        // DELETE: api/ReviewParameters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReviewParameter(int id)
        {
            var reviewParameter = await _context.ReviewParameters.FindAsync(id);
            if (reviewParameter == null)
            {
                return NotFound();
            }

            _context.ReviewParameters.Remove(reviewParameter);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReviewParameterExists(int id)
        {
            return _context.ReviewParameters.Any(e => e.ReviewParameterID == id);
        }
    }
}
