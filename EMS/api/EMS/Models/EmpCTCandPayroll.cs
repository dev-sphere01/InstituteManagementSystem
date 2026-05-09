using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpCTCandPayroll
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmpCtcID { get; set; }

        [Required]
        public int EmpID { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "CTC Amount must be greater than 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CtcAmount { get; set; }

        public bool IsHourlyEmployee { get; set; }

        // Hourly employee specific properties (optional)
        [Column(TypeName = "decimal(18,2)")]
        public decimal? HourlyRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? WorkingHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MonthlyBasicPay { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Basic Salary must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BasicSalary { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "HRA must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Hra { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "DA must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Da { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "LTA must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Lta { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Special Allowance must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SpecialAllowance { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Performance Bonus must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PerformanceBonus { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Gross Salary must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossSalary { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Net Salary must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAnnualSalary { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Net Salary must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetMonthlyPayable { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Total Deductions must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal EPFEmployee { get; set; }

        // ✅ New fields for RD and Health Insurance
        [Range(0, double.MaxValue, ErrorMessage = "RD must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? RD { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Health Insurance must be non-negative")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? HealthInsurance { get; set; }

        public bool EpfApplicable { get; set; }

        public bool EsiApplicable { get; set; }

        public bool ProfessionalTaxApplicable { get; set; }

        [Required]
        public DateTime EffectiveDate { get; set; }
    }

    public class CTCAssignmentResponseModel : EmpCTCandPayroll
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; }
        public string DepartmentName { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }

    public class UpdateCTCAssignmentModel : EmpCTCandPayroll
    {
        [Required]
        public int Id { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public string UpdateReason { get; set; }
    }
}
