using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using EMS.Models.NonDBModels;
using EMS.Services;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpProfDetailsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpProfDetailsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpProfDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpProfDetail>>> GetEmpProfDetails()
        {
            return await _context.EmpProfDetails.ToListAsync();
        }

        // GET: api/EmpProfDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<EmpProfDetail>>> GetEmpProfDetail(int id)
        {
            var empProfDetail = await _context.EmpProfDetails.Where(epd => epd.EmpID == id).ToListAsync();

            if (empProfDetail == null)
            {
                return NotFound();
            }

            return empProfDetail;
        }

        // PUT: api/EmpProfDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // PUT: api/EmpProfDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpProfDetail(int id, EmpProfDetail empProfDetail)
        {
            if (empProfDetail == null)
            {
                return BadRequest("Professional detail data is required.");
            }
            empProfDetail.EpdID = id;

            var existing = await _context.EmpProfDetails.FirstOrDefaultAsync(p => p.EpdID == id);
            if (existing == null)
            {
                return NotFound($"Professional detail with ID {id} not found.");
            }

            var oldState = System.Text.Json.JsonSerializer.Serialize(existing);

            existing.PreviousCompany = empProfDetail.PreviousCompany;
            existing.PreviousPosition = empProfDetail.PreviousPosition;
            existing.PreviousExperience = empProfDetail.PreviousExperience;

            _context.EmpProfDetails.Update(existing);

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Professional Detail",
                    $"Updated professional detail {id} for employee {empProfDetail.EmpID}",
                    empProfDetail.EmpID.ToString(),
                    oldState,
                    System.Text.Json.JsonSerializer.Serialize(existing)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpProfDetailExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(existing);
        }

        // POST: api/EmpProfDetails
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpProfDetail>> PostEmpProfDetail(EmpProfDetailDTO empProfDetail)
        {
            if(empProfDetail == null)
            {
                return BadRequest("Invalid employee professional detail data.");
            }

            var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "PreviousExperience");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }
            var emp = await _context.EmpCreds.FirstOrDefaultAsync(em => em.EmpID == empProfDetail.EmpID);
            var prevExpCount = await _context.EmpProfDetails
                .CountAsync(epd => epd.EmpID == empProfDetail.EmpID);

            string? certPath = null;
            if (empProfDetail.PrevExpCert != null && empProfDetail.PrevExpCert.Length > 0)
            {
                var extension = Path.GetExtension(empProfDetail.PrevExpCert.FileName);
                var fileName = $"{emp?.UserName ?? "Emp"}_Previous_Exp_{prevExpCount+1}{extension}";
                var filePath = Path.Combine(uploadsFolderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await empProfDetail.PrevExpCert.CopyToAsync(stream);
                }
                certPath = $"/PreviousExperience/{fileName}";
            }

            var empProfDetail1 = new EmpProfDetail
            {
                EmpID = empProfDetail.EmpID,
                PreviousCompany = empProfDetail.PreviousCompany,
                PreviousPosition = empProfDetail.PreviousPosition,
                PreviousExperience = empProfDetail.PreviousExperience,
                PreviousExperienceCeritificate = certPath
            };

            _context.EmpProfDetails.Add(empProfDetail1);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Professional Detail",
                $"Created professional detail for employee {empProfDetail.EmpID}",
                empProfDetail.EmpID.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(empProfDetail1)
            );

            return CreatedAtAction("GetEmpProfDetail", new { id = empProfDetail1.EpdID }, empProfDetail);
        }

        // DELETE: api/EmpProfDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpProfDetail(int id)
        {
            var empProfDetail = await _context.EmpProfDetails.FindAsync(id);
            if (empProfDetail == null)
            {
                return NotFound();
            }

            _context.EmpProfDetails.Remove(empProfDetail);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Professional Detail",
                $"Deleted professional detail {id} for employee {empProfDetail.EmpID}",
                empProfDetail.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empProfDetail),
                null
            );

            return NoContent();
        }

        private bool EmpProfDetailExists(int id)
        {
            return _context.EmpProfDetails.Any(e => e.EpdID == id);
        }
    }
}
