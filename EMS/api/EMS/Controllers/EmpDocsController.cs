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
    public class EmpDocsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpDocsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpDocs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpDoc>>> GetEmpDocs()
        {
            return await _context.EmpDocs.ToListAsync();
        }

        // GET: api/EmpDocs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<EmpDoc>>> GetEmpDoc(int id)
        {
            var empDoc = await _context.EmpDocs.Where(ed=> ed.EmpId == id).ToListAsync();

            if (empDoc == null)
            {
                return NotFound();
            }

            return empDoc;
        }

        // PUT: api/EmpDocs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpDoc(int id, EmpDoc empDoc)
        {
            if (id != empDoc.EmpDocId)
            {
                return BadRequest();
            }

            var oldDoc = await _context.EmpDocs.AsNoTracking().FirstOrDefaultAsync(d => d.EmpDocId == id);
            if (oldDoc == null) return NotFound();

            _context.Entry(empDoc).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Document",
                    $"Updated document {id} for employee {empDoc.EmpId}",
                    empDoc.EmpId.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(oldDoc),
                    System.Text.Json.JsonSerializer.Serialize(empDoc)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpDocExists(id))
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

        // POST: api/EmpDocs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpDoc>> PostEmpDoc([FromForm] EMPDocDTO empDoc)
        {
            if (empDoc == null || empDoc.DocFile == null)
            {
                return BadRequest("Invalid document data.");
            }

            var existingempdoc = await _context.EmpDocs
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmpId == empDoc.EmpId && e.DocName == empDoc.DocName);
            
            if (existingempdoc != null)
            {
                var uploadsFolderPath1 = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Docs");
                if (!Directory.Exists(uploadsFolderPath1))
                {
                    Directory.CreateDirectory(uploadsFolderPath1);
                }
                var emp1 = await _context.EmpCreds.FirstOrDefaultAsync(em=>em.EmpID == empDoc.EmpId);

                var fileName1 = $"{emp1.UserName}_{empDoc.DocName}.{empDoc.DocFile.FileName.Split('.')[1]}";
                var filePath1 = Path.Combine(uploadsFolderPath1, fileName1);

                using (var stream = new FileStream(filePath1, FileMode.Create))
                {
                    await empDoc.DocFile.CopyToAsync(stream);
                }
                
                var docToUpdate = await _context.EmpDocs.FindAsync(existingempdoc.EmpDocId);
                docToUpdate.DocName = empDoc.DocName;
                docToUpdate.DocIDNumber = empDoc.DocIDNumber;
                docToUpdate.DocPath = $"/Docs/{fileName1}"; 
                
                _context.EmpDocs.Update(docToUpdate);
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Document",
                    $"Updated document {empDoc.DocName} for employee {empDoc.EmpId}",
                    empDoc.EmpId.ToString(),
                    System.Text.Json.JsonSerializer.Serialize(existingempdoc),
                    System.Text.Json.JsonSerializer.Serialize(docToUpdate)
                );
                
                return Ok(docToUpdate);
            }
            
            var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Docs");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }
            var emp = await _context.EmpCreds.FirstOrDefaultAsync(em => em.EmpID == empDoc.EmpId);

            var fileName = $"{emp.UserName}_{empDoc.DocName}.{empDoc.DocFile.FileName.Split('.')[1]}";
            var filePath = Path.Combine(uploadsFolderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await empDoc.DocFile.CopyToAsync(stream);
            }

            var empDoc1 = new EmpDoc
            {
                EmpId = empDoc.EmpId,
                DocName = empDoc.DocName,
                DocIDNumber = empDoc.DocIDNumber,
                DocPath = $"/Docs/{fileName}"
            };

            _context.EmpDocs.Add(empDoc1);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Document",
                $"Uploaded document {empDoc.DocName} for employee {empDoc.EmpId}",
                empDoc.EmpId.ToString(),
                null,
                System.Text.Json.JsonSerializer.Serialize(empDoc1)
            );

            return CreatedAtAction("GetEmpDoc", new { id = empDoc1.EmpDocId }, empDoc);
        }

        // DELETE: api/EmpDocs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpDoc(int id)
        {
            var empDoc = await _context.EmpDocs.FindAsync(id);
            if (empDoc == null)
            {
                return NotFound();
            }

            _context.EmpDocs.Remove(empDoc);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Delete Document",
                $"Deleted document {id} for employee {empDoc.EmpId}",
                empDoc.EmpId.ToString(),
                System.Text.Json.JsonSerializer.Serialize(empDoc),
                null
            );

            return NoContent();
        }

        private bool EmpDocExists(int id)
        {
            return _context.EmpDocs.Any(e => e.EmpDocId == id);
        }
    }
}
