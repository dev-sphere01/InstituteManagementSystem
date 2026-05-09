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
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpProfDetail(int id, EmpProfDetail empProfDetail)
        {
            if (id != empProfDetail.EpdID)
            {
                return BadRequest();
            }

            var oldDetail = await _context.EmpProfDetails.AsNoTracking().FirstOrDefaultAsync(p => p.EpdID == id);
            if (oldDetail == null) return NotFound();

            _context.Entry(empProfDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Professional Detail",
                    $"Updated professional detail {id} for employee {empProfDetail.EmpID}",
                    empProfDetail.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldDetail),
                    System.Text.Json.JsonSerializer.Serialize(empProfDetail)
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

            return NoContent();
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

            var fileName = $"{emp.UserName}_Previous_Exp_{prevExpCount+1}.{empProfDetail.PrevExpCert.FileName.Split('.')[1]}";
            var filePath = Path.Combine(uploadsFolderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await empProfDetail.PrevExpCert.CopyToAsync(stream);
            }

            var empProfDetail1 = new EmpProfDetail
            {
                EmpID = empProfDetail.EmpID,
                PreviousCompany = empProfDetail.PreviousCompany,
                PreviousPosition = empProfDetail.PreviousPosition,
                PreviousExperience = empProfDetail.PreviousExperience,
                PreviousExperienceCeritificate = $"/PreviousExperience/{fileName}"
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
