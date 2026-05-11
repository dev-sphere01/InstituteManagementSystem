using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Monthly payroll record computed by SimplePayrollService.
    /// One record per employee per month/year (unique constraint).
    /// Status: Draft → Processed → Approved
    /// Once Approved the record is locked; salary slips are only generated for Approved records.
    /// </summary>
    public class SimplePayroll
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int EmpID { get; set; }

        [ForeignKey("EmpID")]
        public Employee? Employee { get; set; }

        [Required]
        [Range(1, 12)]
        public int Month { get; set; }

        [Required]
        public int Year { get; set; }

        /// <summary>Draft / Processed / Approved</summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Draft";

        // ── Attendance Summary ────────────────────────────────────────────────
        public int WorkingDays { get; set; }
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int HalfDays { get; set; }
        public int LateDays { get; set; }
        public int HolidayWorkingDays { get; set; }
        public int LeaveDays { get; set; }

        // ── Salary Base ───────────────────────────────────────────────────────
        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlySalary { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DailySalary { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EarnedSalary { get; set; }

        // ── Earnings ──────────────────────────────────────────────────────────
        [Column(TypeName = "decimal(18,2)")]
        public decimal HolidayPay { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TravelAllowance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal FoodAllowance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal MobileAllowance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal OtherAllowance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Bonus { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal OtherIncome { get; set; } = 0;

        // ── Deductions ────────────────────────────────────────────────────────
        [Column(TypeName = "decimal(18,2)")]
        public decimal AbsentDeduction { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal HalfDayDeduction { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalFine { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal OtherDeduction { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal HoldingAmount { get; set; } = 0;

        // ── Net Pay ───────────────────────────────────────────────────────────
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetPay { get; set; }

        // ── Audit ─────────────────────────────────────────────────────────────
        [MaxLength(50)]
        public string? ProcessedByImsId { get; set; }

        public DateTime? ProcessedAt { get; set; }

        [MaxLength(50)]
        public string? ApprovedByImsId { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
