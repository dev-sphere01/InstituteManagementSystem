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
    public class ReviewSessionsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public ReviewSessionsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/ReviewSessions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewSession>>> GetReviewSessions()
        {
            return await _context.ReviewSessions.ToListAsync();
        }

        // GET: api/ReviewSessions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewSession>> GetReviewSession(int id)
        {
            var reviewSession = await _context.ReviewSessions.FindAsync(id);

            if (reviewSession == null)
            {
                return NotFound();
            }

            return reviewSession;
        }

        // PUT: api/ReviewSessions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReviewSession(int id, ReviewSession reviewSession)
        {
            if (id != reviewSession.ReviewSessionID)
            {
                return BadRequest();
            }

            _context.Entry(reviewSession).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewSessionExists(id))
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

        // POST: api/ReviewSessions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ReviewSession>> PostReviewSession(ReviewSession reviewSession)
        {
            _context.ReviewSessions.Add(reviewSession);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReviewSession", new { id = reviewSession.ReviewSessionID }, reviewSession);
        }

        // DELETE: api/ReviewSessions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReviewSession(int id)
        {
            var reviewSession = await _context.ReviewSessions.FindAsync(id);
            if (reviewSession == null)
            {
                return NotFound();
            }

            _context.ReviewSessions.Remove(reviewSession);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReviewSessionExists(int id)
        {
            return _context.ReviewSessions.Any(e => e.ReviewSessionID == id);
        }
    }
}
