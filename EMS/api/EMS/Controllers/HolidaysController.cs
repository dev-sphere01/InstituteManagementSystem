using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using ClosedXML.Excel;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HolidaysController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public HolidaysController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/Holidays
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Holiday>>> GetHolidays()
        {
            return await _context.Holidays.ToListAsync();
        }

        // GET: api/Holidays/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Holiday>> GetHoliday(int id)
        {
            var holiday = await _context.Holidays.FindAsync(id);

            if (holiday == null)
            {
                return NotFound();
            }

            return holiday;
        }

        [HttpGet("GetAllHolidaybyYear/{year}")]
        public async Task<ActionResult<IEnumerable<Holiday>>> GetHolidaysbyYear(int year)
        {
            var holidays = await _context.Holidays.Where(h => h.Year == year).ToListAsync();
            if (holidays == null || holidays.Count == 0)
            {
                return NotFound();
            }
            return Ok(holidays);
        }

        // PUT: api/Holidays/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHoliday(int id, Holiday holiday)
        {
            if (id != holiday.HID)
            {
                return BadRequest();
            }

            _context.Entry(holiday).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HolidayExists(id))
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

        // POST: api/Holidays
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("ImportHolidays")]
        public async Task<ActionResult> ImportHolidays([FromForm] int Year, IFormFile formFile)
        {
            if (formFile == null || formFile.Length == 0)
                return BadRequest("Please upload a valid Excel file.");

            var holidays = new List<Holiday>();

            try
            {
                using (var stream = new MemoryStream())
                {
                    await formFile.CopyToAsync(stream);
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheets.First();
                        var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header row

                        foreach (var row in rows)
                        {
                            string name = row.Cell(1).GetString();
                            string dateStartStr = row.Cell(2).GetString();
                            string dateEndStr = row.Cell(3).GetString();

                            if (string.IsNullOrWhiteSpace(name))
                                continue;

                            // Try parse DateStart
                            if (!DateTime.TryParse(dateStartStr, out DateTime dateStart))
                                continue;

                            // Try parse DateEnd, default to DateStart if empty
                            DateTime dateEnd = dateStart;
                            if (DateTime.TryParse(dateEndStr, out DateTime parsedEnd))
                                dateEnd = parsedEnd;

                            // Generate multiple entries if it's a range
                            for (var dt = dateStart; dt <= dateEnd; dt = dt.AddDays(1))
                            {
                                holidays.Add(new Holiday
                                {
                                    HolidayName = name,
                                    Date = dt,
                                    Year = Year
                                });
                            }
                        }
                    }
                }

                // Optional: Remove old holidays for the same year
                var existingHolidays = _context.Holidays.Where(h => h.Year == Year);
                _context.Holidays.RemoveRange(existingHolidays);

                await _context.Holidays.AddRangeAsync(holidays);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = $"Successfully imported {holidays.Count} holidays for {Year}.",
                    Count = holidays.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing file: {ex.Message}");
            }
        }


        // DELETE: api/Holidays/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHoliday(int id)
        {
            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null)
            {
                return NotFound();
            }

            _context.Holidays.Remove(holiday);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HolidayExists(int id)
        {
            return _context.Holidays.Any(e => e.HID == id);
        }
    }
}
