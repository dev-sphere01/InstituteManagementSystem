using EMS.Data;
using EMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfflinePayrollController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public OfflinePayrollController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/OfflinePayroll?month=1&year=2025
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OfflinePayroll>>> GetOfflinePayrolls(int? month, int? year)
        {
            var query = _context.OfflinePayrolls.AsQueryable();

            if (month.HasValue)
                query = query.Where(o => o.Month == month.Value);

            if (year.HasValue)
                query = query.Where(o => o.Year == year.Value);

            return await query.ToListAsync();
        }

        // POST: api/OfflinePayroll
        [HttpPost]
        public async Task<ActionResult<OfflinePayroll>> PostOfflinePayroll(OfflinePayroll offlinePayroll)
        {
            _context.OfflinePayrolls.Add(offlinePayroll);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOfflinePayrolls), new { id = offlinePayroll.OfflineID }, offlinePayroll);
        }

        // PUT: api/OfflinePayroll/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOfflinePayroll(int id, OfflinePayroll offlinePayroll)
        {
            if (id != offlinePayroll.OfflineID)
                return BadRequest();

            _context.Entry(offlinePayroll).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.OfflinePayrolls.Any(e => e.OfflineID == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/OfflinePayroll/ByMonthAndYear?month=1&year=2025
        [HttpDelete("ByMonthAndYear")]
        public async Task<IActionResult> DeleteByMonthAndYear(int month, int year)
        {
            var records = await _context.OfflinePayrolls
                .Where(o => o.Month == month && o.Year == year)
                .ToListAsync();

            if (!records.Any())
                return NotFound();

            _context.OfflinePayrolls.RemoveRange(records);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/OfflinePayroll/BulkImport?month=1&year=2025
        // Replaces all existing offline payroll records for the given month/year with the uploaded data.
        [HttpPost("BulkImport")]
        public async Task<IActionResult> BulkImport([FromBody] List<OfflinePayrollImportDto> records, [FromQuery] int month, [FromQuery] int year)
        {
            if (records == null || !records.Any())
                return BadRequest(new { Message = "No records provided." });

            if (month < 1 || month > 12 || year < 2000)
                return BadRequest(new { Message = "Invalid month or year." });

            var errors = new List<string>();
            var toInsert = new List<OfflinePayroll>();

            foreach (var r in records)
            {
                if (r.EmpID <= 0)
                {
                    errors.Add($"Row skipped: invalid EmpID '{r.EmpID}'.");
                    continue;
                }

                toInsert.Add(new OfflinePayroll
                {
                    EmpID = r.EmpID,
                    BasicSalary = r.BasicSalary,
                    SalaryAsPerHours = r.SalaryAsPerHours,
                    ESI = r.ESI,
                    EPF = r.EPF,
                    RD = r.RD,
                    Advances = r.Advances,
                    Deductions = r.Deductions,
                    NetPay = r.NetPay,
                    Hours = r.Hours,
                    Month = month,
                    Year = year
                });
            }

            if (!toInsert.Any())
                return BadRequest(new { Message = "No valid records to import.", Errors = errors });

            // Replace existing records for this period
            var existing = await _context.OfflinePayrolls
                .Where(o => o.Month == month && o.Year == year)
                .ToListAsync();

            if (existing.Any())
                _context.OfflinePayrolls.RemoveRange(existing);

            await _context.OfflinePayrolls.AddRangeAsync(toInsert);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Successfully imported {toInsert.Count} record(s) for {month}/{year}.",
                Imported = toInsert.Count,
                Replaced = existing.Count,
                Errors = errors
            });
        }

        // GET: api/OfflinePayroll/Reconcile?month=1&year=2025
        [HttpGet("Reconcile")]
        public async Task<ActionResult<IEnumerable<Dictionary<string, object?>>>> ReconcilePayroll(int month, int year)
        {
            var results = new List<Dictionary<string, object?>>();

            await _context.Database.OpenConnectionAsync();

            try
            {
                var connection = _context.Database.GetDbConnection();
                using var command = connection.CreateCommand();
                command.CommandText = $"CALL sp_ReconcilePayroll({month}, {year})";
                command.CommandType = CommandType.Text;

                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object?>();
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    }
                    results.Add(row);
                }

                return Ok(results);
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }

    public class OfflinePayrollImportDto
    {
        public int EmpID { get; set; }
        public decimal? BasicSalary { get; set; }
        public decimal? SalaryAsPerHours { get; set; }
        public decimal? ESI { get; set; }
        public decimal? EPF { get; set; }
        public decimal? RD { get; set; }
        public decimal? Advances { get; set; }
        public decimal? Deductions { get; set; }
        public decimal? NetPay { get; set; }
        public decimal? Hours { get; set; }
    }
}
