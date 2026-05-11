using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpTypesController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public EmpTypesController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/EmpTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetEmpTypes()
        {
            var types = await _context.EmpTypes.OrderBy(t => t.EmpTypeName).ToListAsync();

            var result = new List<object>();
            foreach (var t in types)
            {
                var empCount = await _context.EmpDeptPositions
                    .Where(edp => edp.EmpTypeID == t.EmpTypeID)
                    .Select(edp => edp.EmpID)
                    .Distinct()
                    .CountAsync();

                result.Add(new
                {
                    t.EmpTypeID,
                    t.EmpTypeName,
                    t.Description,
                    EmployeeCount = empCount
                });
            }

            return Ok(result);
        }

        // GET: api/EmpTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpType>> GetEmpType(int id)
        {
            var empType = await _context.EmpTypes.FindAsync(id);
            if (empType == null) return NotFound();
            return Ok(empType);
        }

        // POST: api/EmpTypes
        [HttpPost]
        public async Task<ActionResult<EmpType>> PostEmpType(EmpType empType)
        {
            if (string.IsNullOrWhiteSpace(empType.EmpTypeName))
                return BadRequest("Employee type name is required.");

            bool exists = await _context.EmpTypes
                .AnyAsync(t => t.EmpTypeName!.ToLower() == empType.EmpTypeName.ToLower().Trim());
            if (exists)
                return Conflict("An employee type with this name already exists.");

            empType.EmpTypeName = empType.EmpTypeName.Trim();
            _context.EmpTypes.Add(empType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmpType), new { id = empType.EmpTypeID }, empType);
        }

        // PUT: api/EmpTypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpType(int id, EmpType empType)
        {
            if (id != empType.EmpTypeID) return BadRequest();

            if (string.IsNullOrWhiteSpace(empType.EmpTypeName))
                return BadRequest("Employee type name is required.");

            bool duplicate = await _context.EmpTypes
                .AnyAsync(t => t.EmpTypeName!.ToLower() == empType.EmpTypeName.ToLower().Trim()
                               && t.EmpTypeID != id);
            if (duplicate)
                return Conflict("Another employee type with this name already exists.");

            empType.EmpTypeName = empType.EmpTypeName.Trim();
            _context.Entry(empType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.EmpTypes.AnyAsync(t => t.EmpTypeID == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/EmpTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpType(int id)
        {
            var empType = await _context.EmpTypes.FindAsync(id);
            if (empType == null) return NotFound();

            bool inUse = await _context.EmpDeptPositions.AnyAsync(edp => edp.EmpTypeID == id);
            if (inUse)
                return Conflict("Cannot delete — this type is assigned to one or more employees.");

            _context.EmpTypes.Remove(empType);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
