using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public LocationsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/Locations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
        {
            return Ok(await _context.Locations.OrderBy(l => l.LocationName).ToListAsync());
        }

        // GET: api/Locations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Location>> GetLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null) return NotFound();
            return Ok(location);
        }

        // POST: api/Locations
        [HttpPost]
        public async Task<ActionResult<Location>> PostLocation(Location location)
        {
            if (string.IsNullOrWhiteSpace(location.LocationName))
                return BadRequest("Location name is required.");

            bool exists = await _context.Locations
                .AnyAsync(l => l.LocationName!.ToLower() == location.LocationName.ToLower().Trim());
            if (exists)
                return Conflict("A branch with this name already exists.");

            location.LocationName = location.LocationName.Trim();
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLocation), new { id = location.LocationID }, location);
        }

        // PUT: api/Locations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLocation(int id, Location location)
        {
            if (id != location.LocationID) return BadRequest();

            if (string.IsNullOrWhiteSpace(location.LocationName))
                return BadRequest("Location name is required.");

            bool duplicate = await _context.Locations
                .AnyAsync(l => l.LocationName!.ToLower() == location.LocationName.ToLower().Trim()
                               && l.LocationID != id);
            if (duplicate)
                return Conflict("Another branch with this name already exists.");

            location.LocationName = location.LocationName.Trim();
            _context.Entry(location).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Locations.AnyAsync(l => l.LocationID == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Locations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null) return NotFound();

            bool inUse = await _context.Employees.AnyAsync(e => e.LocationID == id);
            if (inUse)
                return Conflict("Cannot delete — employees are assigned to this branch.");

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
