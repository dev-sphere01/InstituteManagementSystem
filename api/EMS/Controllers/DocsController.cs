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
    public class DocsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public DocsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/Docs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Docs>>> GetDocs()
        {
            return await _context.Docs.ToListAsync();
        }

        // GET: api/Docs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Docs>> GetDocs(int id)
        {
            var docs = await _context.Docs.FindAsync(id);

            if (docs == null)
            {
                return NotFound();
            }

            return docs;
        }

        // PUT: api/Docs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDocs(int id, Docs docs)
        {
            if (id != docs.DocID)
            {
                return BadRequest();
            }

            _context.Entry(docs).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DocsExists(id))
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

        // POST: api/Docs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Docs>> PostDocs(Docs docs)
        {
            _context.Docs.Add(docs);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDocs", new { id = docs.DocID }, docs);
        }

        // DELETE: api/Docs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocs(int id)
        {
            var docs = await _context.Docs.FindAsync(id);
            if (docs == null)
            {
                return NotFound();
            }

            _context.Docs.Remove(docs);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DocsExists(int id)
        {
            return _context.Docs.Any(e => e.DocID == id);
        }
    }
}
