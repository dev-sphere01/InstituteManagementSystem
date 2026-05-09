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
using Azure.Core;
using NPOI.HPSF;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpBankDetailsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpBankDetailsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpBankDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpBankDetail>>> GetEmpBankDetails()
        {
            return await _context.EmpBankDetails.ToListAsync();
        }

        // GET: api/EmpBankDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpBankDetail>> GetEmpBankDetail(int id)
        {
            var empBankDetail = await _context.EmpBankDetails.FirstOrDefaultAsync(edp => edp.EmpID == id);

            if (empBankDetail == null)
            {
                return NotFound();
            }

            return empBankDetail;
        }

        // PUT: api/EmpBankDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpBankDetail(int id, [FromForm]EmpBankDetail empBankDetail)
        {
            if (id != empBankDetail.EbdID)
            {
                return BadRequest();
            }

            var oldDetail = await _context.EmpBankDetails.AsNoTracking().FirstOrDefaultAsync(b => b.EbdID == id);
            if (oldDetail == null) return NotFound();

            _context.Entry(empBankDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Bank Detail",
                    $"Updated bank detail {id} for employee {empBankDetail.EmpID}",
                    empBankDetail.EmpID.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldDetail),
                    System.Text.Json.JsonSerializer.Serialize(empBankDetail)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpBankDetailExists(id))
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

        // POST: api/EmpBankDetails
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpBankDetail>> PostEmpBankDetail([FromForm] EmpBankDetailsDTO empBankDetail)
        {


            if (empBankDetail == null)
            {
                return BadRequest("EmpBankDetail data is null.");
            }
            var uploadsFolderPath1 = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "CancelledCheque");
            if (!Directory.Exists(uploadsFolderPath1))
            {
                Directory.CreateDirectory(uploadsFolderPath1);
            }

            var emp = await _context.EmpCreds.FirstOrDefaultAsync(em => em.EmpID == empBankDetail.EmpID);
            if (emp == null)
            {
                return NotFound($"Employee with ID {empBankDetail.EmpID} not found.");
            }

            if (empBankDetail.CancelledCheque != null && empBankDetail.CancelledCheque.Length != 0)
            {
                var extension = Path.GetExtension(empBankDetail.CancelledCheque.FileName);
                var filename = $"{emp.UserName}_CancelledCheque.{extension}";


                var filePath = Path.Combine(uploadsFolderPath1, filename);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await empBankDetail.CancelledCheque.CopyToAsync(stream);
                }
                var existingBankDetail = await _context.EmpBankDetails
                .FirstOrDefaultAsync(e => e.EmpID == empBankDetail.EmpID);
                if (existingBankDetail != null)
                {
                    existingBankDetail.BankName = empBankDetail.BankName;
                    existingBankDetail.AccountNumber = empBankDetail.AccountNumber;
                    existingBankDetail.IFSCCode = empBankDetail.IFSCCode;
                    existingBankDetail.BranchName = empBankDetail.BranchName;
                    existingBankDetail.CancelledCheque = $"/CancelledCheque/{filename}"; // Store the file name instead of the file path
                    _context.EmpBankDetails.Update(existingBankDetail);
                    await _context.SaveChangesAsync();

                    await _logger.LogActivityAsync(
                        "Employee Profile",
                        "Update Bank Detail",
                        $"Updated bank details for employee {empBankDetail.EmpID}",
                        empBankDetail.EmpID.ToString(),
                        null, // old state not easily captured here without AsNoTracking call
                        System.Text.Json.JsonSerializer.Serialize(existingBankDetail)
                    );

                    return Ok(existingBankDetail);
                }
                else
                {

                    var empBankDetail1 = new EmpBankDetail
                    {
                        EmpID = empBankDetail.EmpID,
                        BankName = empBankDetail.BankName,
                        AccountNumber = empBankDetail.AccountNumber,
                        IFSCCode = empBankDetail.IFSCCode,
                        BranchName = empBankDetail.BranchName,
                        CancelledCheque = $"/CancelledCheque/{filename}" // Store the file name instead of the file path
                    };
                    _context.EmpBankDetails.Add(empBankDetail1);
                    await _context.SaveChangesAsync();

                    await _logger.LogActivityAsync(
                        "Employee Profile",
                        "Create Bank Detail",
                        $"Created bank details for employee {empBankDetail.EmpID}",
                        empBankDetail.EmpID.ToString(),
                        null,
                        System.Text.Json.JsonSerializer.Serialize(empBankDetail1)
                    );

                    return CreatedAtAction("GetEmpBankDetail", new { id = empBankDetail1.EbdID }, empBankDetail1);
                }
            }
            else
            {
                var existingBankDetail = await _context.EmpBankDetails
                .FirstOrDefaultAsync(e => e.EmpID == empBankDetail.EmpID);
                if (existingBankDetail != null)
                {
                    existingBankDetail.BankName = empBankDetail.BankName;
                    existingBankDetail.AccountNumber = empBankDetail.AccountNumber;
                    existingBankDetail.IFSCCode = empBankDetail.IFSCCode;
                    existingBankDetail.BranchName = empBankDetail.BranchName;
                    _context.EmpBankDetails.Update(existingBankDetail);
                    await _context.SaveChangesAsync();
                    return Ok(existingBankDetail);
                }
                else
                {

                    var empBankDetail1 = new EmpBankDetail
                    {
                        EmpID = empBankDetail.EmpID,
                        BankName = empBankDetail.BankName,
                        AccountNumber = empBankDetail.AccountNumber,
                        IFSCCode = empBankDetail.IFSCCode,
                        BranchName = empBankDetail.BranchName,
                    };
                    _context.EmpBankDetails.Add(empBankDetail1);
                    await _context.SaveChangesAsync();
                    return CreatedAtAction("GetEmpBankDetail", new { id = empBankDetail1.EbdID }, empBankDetail1);
                }
            }

        }

        [HttpPost("Create")]
        public async Task<ActionResult<EmpBankDetail>> PostEmpBankDetail(List<EmpBankDetailsDTO> empBankDetail)
        {

            if (empBankDetail == null)
            {
                return BadRequest("EmpBankDetail data is null.");
            }

            foreach (var empBank in empBankDetail)
            {

                var uploadsFolderPath1 = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "CancelledCheque");
                if (!Directory.Exists(uploadsFolderPath1))
                {
                    Directory.CreateDirectory(uploadsFolderPath1);
                }

                var emp = await _context.EmpCreds.FirstOrDefaultAsync(em => em.EmpID == empBank.EmpID);
                if (emp == null)
                {
                    return NotFound($"Employee with ID {empBank.EmpID} not found.");
                }

                if (empBank.CancelledCheque != null && empBank.CancelledCheque.Length != 0)
                {
                    var extension = Path.GetExtension(empBank.CancelledCheque.FileName);
                    var filename = $"{emp.UserName}_CancelledCheque.{extension}";

                    var filePath = Path.Combine(uploadsFolderPath1, filename);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await empBank.CancelledCheque.CopyToAsync(stream);
                    }
                    var existingBankDetail = await _context.EmpBankDetails
                    .FirstOrDefaultAsync(e => e.EmpID == empBank.EmpID);
                    if (existingBankDetail != null)
                    {
                        existingBankDetail.BankName = empBank.BankName;
                        existingBankDetail.AccountNumber = empBank.AccountNumber;
                        existingBankDetail.IFSCCode = empBank.IFSCCode;
                        existingBankDetail.BranchName = empBank.BranchName;
                        existingBankDetail.CancelledCheque = $"/CancelledCheque/{filename}"; // Store the file name instead of the file path
                        _context.EmpBankDetails.Update(existingBankDetail);
                        await _context.SaveChangesAsync();
                        return Ok(existingBankDetail);
                    }
                    else
                    {

                        var empBankDetail1 = new EmpBankDetail
                        {
                            EmpID = empBank.EmpID,
                            BankName = empBank.BankName,
                            AccountNumber = empBank.AccountNumber,
                            IFSCCode = empBank.IFSCCode,
                            BranchName = empBank.BranchName,
                            CancelledCheque = $"/CancelledCheque/{filename}" // Store the file name instead of the file path
                        };
                        _context.EmpBankDetails.Add(empBankDetail1);
                        await _context.SaveChangesAsync();
                        return CreatedAtAction("GetEmpBankDetail", new { id = empBankDetail1.EbdID }, empBankDetail1);
                    }
                }
                else
                {
                    var existingBankDetail = await _context.EmpBankDetails
                    .FirstOrDefaultAsync(e => e.EmpID == empBank.EmpID);
                    if (existingBankDetail != null)
                    {
                        existingBankDetail.BankName = empBank.BankName;
                        existingBankDetail.AccountNumber = empBank.AccountNumber;
                        existingBankDetail.IFSCCode = empBank.IFSCCode;
                        existingBankDetail.BranchName = empBank.BranchName;
                        _context.EmpBankDetails.Update(existingBankDetail);
                        await _context.SaveChangesAsync();
                    }
                    else
                    {

                        var empBankDetail1 = new EmpBankDetail
                        {
                            EmpID = empBank.EmpID,
                            BankName = empBank.BankName,
                            AccountNumber = empBank.AccountNumber,
                            IFSCCode = empBank.IFSCCode,
                            BranchName = empBank.BranchName,
                        };
                        _context.EmpBankDetails.Add(empBankDetail1);
                        await _context.SaveChangesAsync();
                        
                    }
                }
            }
            return Ok("Data Saved Successfully");

        }

        // DELETE: api/EmpBankDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpBankDetail(int id)
        {
            var empBankDetail = await _context.EmpBankDetails.FindAsync(id);
            if (empBankDetail == null)
            {
                return NotFound();
            }

            _context.EmpBankDetails.Remove(empBankDetail);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Bank Detail",
                $"Deleted bank details for employee {empBankDetail.EmpID}",
                empBankDetail.EmpID.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empBankDetail),
                null
            );

            return NoContent();
        }

        private bool EmpBankDetailExists(int id)
        {
            return _context.EmpBankDetails.Any(e => e.EbdID == id);
        }
    }
}
