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
    public class PayrollSlabsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public PayrollSlabsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/PayrollSlabs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollSlab>>> GetSlabs()
        {
            return await _context.PayrollSlabs.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<PayrollSlab>> AddSlab(PayrollSlab slab)
        {
            _context.PayrollSlabs.Add(slab);
            await _context.SaveChangesAsync();
            return Ok(slab);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlab(int id, PayrollSlab slab)
        {
            if (id != slab.SlabID) return BadRequest();

            _context.Entry(slab).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlab(int id)
        {
            var slab = await _context.PayrollSlabs.FindAsync(id);
            if (slab == null) return NotFound();

            _context.PayrollSlabs.Remove(slab);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool PayrollSlabExists(int id)
        {
            return _context.PayrollSlabs.Any(e => e.SlabID == id);
        }
    }
}
