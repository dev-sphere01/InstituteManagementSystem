using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Models;
using EMS.Data;
using System.Text.Json;
using EMS.Services;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpCTCandPayrollsController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IUserActivityLogger _logger;

        public EmpCTCandPayrollsController(EMSDbContext context, IUserActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/EmpCTCandPayrolls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpCTCandPayroll>>> GetEmpCTCandPayrolls()
        {
            return await _context.EmpCTCandPayrolls.ToListAsync();
        }

        // GET: api/EmpCTCandPayrolls/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpCTCandPayroll>> GetEmpCTCandPayroll(int id)
        {
            var empCTCandPayroll = await _context.EmpCTCandPayrolls.FindAsync(id);

            if (empCTCandPayroll == null)
            {
                return NotFound();
            }

            return empCTCandPayroll;
        }

        [HttpGet("ByEmployee/{empId}")]
        public async Task<ActionResult<EmpCTCandPayroll>> GetEmpCTCandPayrollbyEmpID(int empId)
        {
            var empCTCandPayroll = await _context.EmpCTCandPayrolls
                .FirstOrDefaultAsync(e => e.EmpID == empId);
            if (empCTCandPayroll == null)
            {
                return NotFound();
            }
            return empCTCandPayroll;
        }

        // PATCH: api/EmpCTCandPayrolls/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchEmpCTCandPayroll(
    int id,
    [FromBody] EmpCTCandPayrollPatchDto dto)
        {
            var payroll = await _context.EmpCTCandPayrolls.FindAsync(id);

            if (payroll == null)
                return NotFound();

            if (dto.CtcAmount.HasValue)
                payroll.CtcAmount = dto.CtcAmount.Value;

            if (dto.IsHourlyEmployee.HasValue)
                payroll.IsHourlyEmployee = dto.IsHourlyEmployee.Value;

            if (dto.HourlyRate.HasValue)
                payroll.HourlyRate = dto.HourlyRate.Value;

            if (dto.WorkingHours.HasValue)
                payroll.WorkingHours = dto.WorkingHours.Value;

            if (dto.MonthlyBasicPay.HasValue)
                payroll.MonthlyBasicPay = dto.MonthlyBasicPay.Value;

            if (dto.BasicSalary.HasValue)
                payroll.BasicSalary = dto.BasicSalary.Value;

            if (dto.Hra.HasValue)
                payroll.Hra = dto.Hra.Value;

            if (dto.Da.HasValue)
                payroll.Da = dto.Da.Value;

            if (dto.Lta.HasValue)
                payroll.Lta = dto.Lta.Value;

            if (dto.SpecialAllowance.HasValue)
                payroll.SpecialAllowance = dto.SpecialAllowance.Value;

            if (dto.PerformanceBonus.HasValue)
                payroll.PerformanceBonus = dto.PerformanceBonus.Value;

            if (dto.GrossSalary.HasValue)
                payroll.GrossSalary = dto.GrossSalary.Value;

            if (dto.NetAnnualSalary.HasValue)
                payroll.NetAnnualSalary = dto.NetAnnualSalary.Value;

            if (dto.NetMonthlyPayable.HasValue)
                payroll.NetMonthlyPayable = dto.NetMonthlyPayable.Value;

            if (dto.EPFEmployee.HasValue)
                payroll.EPFEmployee = dto.EPFEmployee.Value;

            if (dto.RD.HasValue)
                payroll.RD = dto.RD.Value;

            if (dto.HealthInsurance.HasValue)
                payroll.HealthInsurance = dto.HealthInsurance.Value;

            if (dto.EpfApplicable.HasValue)
                payroll.EpfApplicable = dto.EpfApplicable.Value;

            if (dto.EsiApplicable.HasValue)
                payroll.EsiApplicable = dto.EsiApplicable.Value;

            if (dto.ProfessionalTaxApplicable.HasValue)
                payroll.ProfessionalTaxApplicable = dto.ProfessionalTaxApplicable.Value;

            if (dto.EffectiveDate.HasValue)
                payroll.EffectiveDate = dto.EffectiveDate.Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // PUT: api/EmpCTCandPayrolls/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpCTCandPayroll(int id, EmpCTCandPayroll empCTCandPayroll)
        {
            if (id != empCTCandPayroll.EmpCtcID)
            {
                return BadRequest();
            }

            _context.Entry(empCTCandPayroll).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpCTCandPayrollExists(id))
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

        // POST: api/EmpCTCandPayrolls
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EmpCTCandPayroll>> PostEmpCTCandPayroll(EmpCTCandPayroll empCTCandPayroll)
        {
            var existingPayroll = await _context.EmpCTCandPayrolls
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmpID == empCTCandPayroll.EmpID);
            
            if (existingPayroll != null)
            {
                var payrollToUpdate = await _context.EmpCTCandPayrolls.FindAsync(existingPayroll.EmpCtcID);
                payrollToUpdate.CtcAmount = empCTCandPayroll.CtcAmount;
                payrollToUpdate.IsHourlyEmployee = empCTCandPayroll.IsHourlyEmployee;
                payrollToUpdate.HourlyRate = empCTCandPayroll.HourlyRate;
                payrollToUpdate.WorkingHours = empCTCandPayroll.WorkingHours;
                payrollToUpdate.MonthlyBasicPay = empCTCandPayroll.MonthlyBasicPay;
                payrollToUpdate.BasicSalary = empCTCandPayroll.BasicSalary;
                payrollToUpdate.Hra = empCTCandPayroll.Hra;
                payrollToUpdate.Da = empCTCandPayroll.Da;
                payrollToUpdate.Lta = empCTCandPayroll.Lta;
                payrollToUpdate.SpecialAllowance = empCTCandPayroll.SpecialAllowance;
                payrollToUpdate.PerformanceBonus = empCTCandPayroll.PerformanceBonus;
                payrollToUpdate.GrossSalary = empCTCandPayroll.GrossSalary;
                payrollToUpdate.NetAnnualSalary = empCTCandPayroll.NetAnnualSalary;
                payrollToUpdate.NetMonthlyPayable = empCTCandPayroll.NetMonthlyPayable;
                payrollToUpdate.EPFEmployee = empCTCandPayroll.EPFEmployee;
                payrollToUpdate.EpfApplicable = empCTCandPayroll.EpfApplicable;
                payrollToUpdate.EsiApplicable = empCTCandPayroll.EsiApplicable;
                payrollToUpdate.ProfessionalTaxApplicable = empCTCandPayroll.ProfessionalTaxApplicable;
                payrollToUpdate.RD = empCTCandPayroll.RD;
                payrollToUpdate.HealthInsurance = empCTCandPayroll.HealthInsurance;
                payrollToUpdate.EffectiveDate = empCTCandPayroll.EffectiveDate;
                
                _context.EmpCTCandPayrolls.Update(payrollToUpdate);
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Payroll",
                    "Update CTC",
                    $"Updated CTC and Payroll for employee {empCTCandPayroll.EmpID}",
                    empCTCandPayroll.EmpID.ToString(),
                    JsonSerializer.Serialize(existingPayroll),
                    JsonSerializer.Serialize(payrollToUpdate)
                );
                
                empCTCandPayroll.EmpCtcID = payrollToUpdate.EmpCtcID;
            }
            else
            {
                _context.EmpCTCandPayrolls.Add(empCTCandPayroll);
                await _context.SaveChangesAsync();

                await _logger.LogActivityAsync(
                    "Payroll",
                    "Assign CTC",
                    $"Assigned CTC and Payroll for employee {empCTCandPayroll.EmpID}",
                    empCTCandPayroll.EmpID.ToString(),
                    null,
                    JsonSerializer.Serialize(empCTCandPayroll)
                );
            }

            return CreatedAtAction("GetEmpCTCandPayroll", new { id = empCTCandPayroll.EmpCtcID }, empCTCandPayroll);
        }

        // DELETE: api/EmpCTCandPayrolls/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpCTCandPayroll(int id)
        {
            var empCTCandPayroll = await _context.EmpCTCandPayrolls.FindAsync(id);
            if (empCTCandPayroll == null)
            {
                return NotFound();
            }

            _context.EmpCTCandPayrolls.Remove(empCTCandPayroll);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Payroll",
                "Delete CTC",
                $"Deleted CTC and Payroll for employee {empCTCandPayroll.EmpID}",
                empCTCandPayroll.EmpID.ToString(),
                JsonSerializer.Serialize(empCTCandPayroll),
                null
            );

            return NoContent();
        }

        private bool EmpCTCandPayrollExists(int id)
        {
            return _context.EmpCTCandPayrolls.Any(e => e.EmpCtcID == id);
        }
    }


    public class EmpCTCandPayrollPatchDto
    {
        public decimal? CtcAmount { get; set; }
        public bool? IsHourlyEmployee { get; set; }

        public decimal? HourlyRate { get; set; }
        public decimal? WorkingHours { get; set; }
        public decimal? MonthlyBasicPay { get; set; }

        public decimal? BasicSalary { get; set; }
        public decimal? Hra { get; set; }
        public decimal? Da { get; set; }
        public decimal? Lta { get; set; }
        public decimal? SpecialAllowance { get; set; }
        public decimal? PerformanceBonus { get; set; }

        public decimal? GrossSalary { get; set; }
        public decimal? NetAnnualSalary { get; set; }
        public decimal? NetMonthlyPayable { get; set; }

        public decimal? EPFEmployee { get; set; }
        public decimal? RD { get; set; }
        public decimal? HealthInsurance { get; set; }

        public bool? EpfApplicable { get; set; }
        public bool? EsiApplicable { get; set; }
        public bool? ProfessionalTaxApplicable { get; set; }

        public DateTime? EffectiveDate { get; set; }

        // Optional audit fields (good practice)
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public string? UpdateReason { get; set; }
    }
}
