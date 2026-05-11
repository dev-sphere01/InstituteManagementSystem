using System;
using System.Collections.Generic;
using System.IO;
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
    public class EMSSettingsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public EMSSettingsController(EMSDbContext context)
        {
            _context = context;
        }

        // --- Letter Templates ---

        [HttpGet("LetterTemplates")]
        public async Task<ActionResult<IEnumerable<LetterTemplate>>> GetLetterTemplates()
        {
            return await _context.LetterTemplates.ToListAsync();
        }

        [HttpPost("LetterTemplates")]
        public async Task<ActionResult<LetterTemplate>> PostLetterTemplate(LetterTemplate template)
        {
            _context.LetterTemplates.Add(template);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLetterTemplates), new { id = template.TemplateID }, template);
        }

        [HttpPut("LetterTemplates/{id}")]
        public async Task<IActionResult> PutLetterTemplate(int id, LetterTemplate template)
        {
            if (id != template.TemplateID) return BadRequest();
            _context.Entry(template).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("LetterTemplates/{id}")]
        public async Task<IActionResult> DeleteLetterTemplate(int id)
        {
            var template = await _context.LetterTemplates.FindAsync(id);
            if (template == null) return NotFound();
            _context.LetterTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Signatory Settings ---

        [HttpGet("SignatorySettings")]
        public async Task<ActionResult<IEnumerable<SignatorySetting>>> GetSignatorySettings()
        {
            return await _context.SignatorySettings.ToListAsync();
        }

        [HttpPost("SignatorySettings")]
        public async Task<ActionResult<SignatorySetting>> PostSignatorySetting([FromForm] SignatorySettingDTO dto)
        {
            string imagePath = null;
            if (dto.SignatureImage != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Signatures");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{dto.SignatureImage.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.SignatureImage.CopyToAsync(stream);
                }
                imagePath = $"/Signatures/{fileName}";
            }

            var signatory = new SignatorySetting
            {
                Name = dto.Name,
                Designation = dto.Designation,
                SignatureImagePath = imagePath,
                IsDefault = dto.IsDefault,
                IsActive = true
            };

            if (signatory.IsDefault)
            {
                // Unset other defaults
                var defaults = await _context.SignatorySettings.Where(s => s.IsDefault).ToListAsync();
                foreach (var d in defaults) d.IsDefault = false;
            }

            _context.SignatorySettings.Add(signatory);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSignatorySettings), new { id = signatory.SignatoryID }, signatory);
        }

        [HttpPut("SignatorySettings/{id}")]
        public async Task<IActionResult> PutSignatorySetting(int id, [FromForm] SignatorySettingDTO dto)
        {
            var signatory = await _context.SignatorySettings.FindAsync(id);
            if (signatory == null) return NotFound();

            signatory.Name = dto.Name;
            signatory.Designation = dto.Designation;
            signatory.IsDefault = dto.IsDefault;

            if (dto.SignatureImage != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Signatures");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{dto.SignatureImage.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.SignatureImage.CopyToAsync(stream);
                }
                signatory.SignatureImagePath = $"/Signatures/{fileName}";
            }

            if (signatory.IsDefault)
            {
                var defaults = await _context.SignatorySettings.Where(s => s.IsDefault && s.SignatoryID != id).ToListAsync();
                foreach (var d in defaults) d.IsDefault = false;
            }

            _context.Entry(signatory).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("SignatorySettings/{id}")]
        public async Task<IActionResult> DeleteSignatorySetting(int id)
        {
            var signatory = await _context.SignatorySettings.FindAsync(id);
            if (signatory == null) return NotFound();
            _context.SignatorySettings.Remove(signatory);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class SignatorySettingDTO
    {
        public string Name { get; set; }
        public string Designation { get; set; }
        public bool IsDefault { get; set; }
        public IFormFile? SignatureImage { get; set; }
    }
}
