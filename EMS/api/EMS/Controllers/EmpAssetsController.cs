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
    public class EmpAssetsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpAssetsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpAssets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpAssets>>> GetEmpAssets()
        {
            return await _context.EmpAssets.ToListAsync();
        }

        // GET: api/EmpAssets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpAssets>> GetEmpAssets(int id)
        {
            var empAssets = await _context.EmpAssets.FindAsync(id);

            if (empAssets == null)
            {
                return NotFound();
            }

            return empAssets;
        }

        // PUT: api/EmpAssets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpAssets(int id, EmpAssets empAssets)
        {
            if (id != empAssets.EmpAssetID)
            {
                return BadRequest();
            }

            var oldAsset = await _context.EmpAssets.AsNoTracking().FirstOrDefaultAsync(a => a.EmpAssetID == id);
            if (oldAsset == null) return NotFound();

            _context.Entry(empAssets).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Asset mapping",
                    $"Updated asset mapping {id} for employee {empAssets.EmpID}",
                    empAssets.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldAsset),
                    System.Text.Json.JsonSerializer.Serialize(empAssets)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpAssetsExists(id))
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

        // POST: api/EmpAssets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpAssets>> PostEmpAssets(EmpAssets empAssets)
        {
            _context.EmpAssets.Add(empAssets);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Asset mapping",
                $"Assigned asset to employee {empAssets.EmpID}",
                empAssets.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(empAssets)
            );

            return CreatedAtAction("GetEmpAssets", new { id = empAssets.EmpAssetID }, empAssets);
        }

        // DELETE: api/EmpAssets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpAssets(int id)
        {
            var empAssets = await _context.EmpAssets.FindAsync(id);
            if (empAssets == null)
            {
                return NotFound();
            }

            _context.EmpAssets.Remove(empAssets);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Asset mapping",
                $"Deleted asset mapping {id} for employee {empAssets.EmpID}",
                empAssets.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empAssets),
                null
            );

            return NoContent();
        }

        private bool EmpAssetsExists(int id)
        {
            return _context.EmpAssets.Any(e => e.EmpAssetID == id);
        }
    }
}
