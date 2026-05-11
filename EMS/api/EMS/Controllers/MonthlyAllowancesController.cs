using EMS.Data;
using EMS.Helpers;
using EMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MonthlyAllowancesController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public MonthlyAllowancesController(EMSDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /api/MonthlyAllowances?empId=&month=&year=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? empId, [FromQuery] int? month, [FromQuery] int? year)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.read"))
                return Forbid();

            var query = _context.MonthlyAllowances.AsQueryable();

            if (empId.HasValue) query = query.Where(a => a.EmpID == empId.Value);
            if (month.HasValue) query = query.Where(a => a.Month == month.Value);
            if (year.HasValue) query = query.Where(a => a.Year == year.Value);

            return Ok(await query.ToListAsync());
        }

        /// <summary>PUT /api/MonthlyAllowances — upsert by empId + month + year</summary>
        [HttpPut]
        public async Task<IActionResult> Upsert([FromBody] MonthlyAllowance dto)
        {
            if (!ImsClaimsHelper.HasPermission(User, "payroll.update"))
                return Forbid();

            var existing = await _context.MonthlyAllowances
                .FirstOrDefaultAsync(a => a.EmpID == dto.EmpID && a.Month == dto.Month && a.Year == dto.Year);

            if (existing == null)
            {
                dto.UpdatedAt = DateTime.UtcNow;
                dto.UpdatedByImsId = ImsClaimsHelper.GetImsUserId(User);
                _context.MonthlyAllowances.Add(dto);
            }
            else
            {
                existing.Travel = dto.Travel;
                existing.Food = dto.Food;
                existing.Mobile = dto.Mobile;
                existing.Other = dto.Other;
                existing.Bonus = dto.Bonus;
                existing.OtherIncome = dto.OtherIncome;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedByImsId = ImsClaimsHelper.GetImsUserId(User);
                _context.MonthlyAllowances.Update(existing);
            }

            await _context.SaveChangesAsync();
            return Ok(existing ?? dto);
        }
    }
}
