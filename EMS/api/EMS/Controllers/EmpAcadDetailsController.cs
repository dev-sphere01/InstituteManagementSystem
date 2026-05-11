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
    public class EmpAcadDetailsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpAcadDetailsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpAcadDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpAcadDetail>>> GetEmpAcadDetails()
        {
            return await _context.EmpAcadDetails.ToListAsync();
        }

        // GET: api/EmpAcadDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<EmpAcadDetail>>> GetEmpAcadDetail(int id)
        {
            var empAcadDetail = await _context.EmpAcadDetails.Where(ead=>ead.EmpID == id).ToListAsync();

            if (empAcadDetail == null)
            {
                return NotFound();
            }

            return empAcadDetail;
        }

        // PUT: api/EmpAcadDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpAcadDetail(int id, EmpAcadDetail empAcadDetail)
        {
            if (id != empAcadDetail.EadID)
            {
                return BadRequest();
            }

            var oldDetail = await _context.EmpAcadDetails.AsNoTracking().FirstOrDefaultAsync(a => a.EadID == id);
            if (oldDetail == null) return NotFound();

            _context.Entry(empAcadDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Academic Detail",
                    $"Updated academic detail {id} for employee {empAcadDetail.EmpID}",
                    empAcadDetail.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldDetail),
                    System.Text.Json.JsonSerializer.Serialize(empAcadDetail)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpAcadDetailExists(id))
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

        // POST: api/EmpAcadDetails
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpAcadDetail>> PostEmpAcadDetail(EmpAcadDetail empAcadDetail)
        {
            _context.EmpAcadDetails.Add(empAcadDetail);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Academic Detail",
                $"Created academic detail for employee {empAcadDetail.EmpID}",
                empAcadDetail.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(empAcadDetail)
            );

            return CreatedAtAction("GetEmpAcadDetail", new { id = empAcadDetail.EadID }, empAcadDetail);
        }

        // DELETE: api/EmpAcadDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpAcadDetail(int id)
        {
            var empAcadDetail = await _context.EmpAcadDetails.FindAsync(id);
            if (empAcadDetail == null)
            {
                return NotFound();
            }

            _context.EmpAcadDetails.Remove(empAcadDetail);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Academic Detail",
                $"Deleted academic detail {id} for employee {empAcadDetail.EmpID}",
                empAcadDetail.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empAcadDetail),
                null
            );

            return NoContent();
        }

        private bool EmpAcadDetailExists(int id)
        {
            return _context.EmpAcadDetails.Any(e => e.EadID == id);
        }
    }
}
