using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Salary holding records — amounts withheld from net pay.
    /// HoldingType options:
    ///   HalfMonth   - Hold 50% of that month's salary
    ///   DaysWise    - Hold DailySalary × HoldDays
    ///   Manual      - HR-specified amount
    ///   JoiningHold - Auto-created when first salary is assigned (joining rule)
    /// Status: Active → Released / Cancelled / Reduced
    /// </summary>
    public class SalaryHolding
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int EmpID { get; set; }

        [ForeignKey("EmpID")]
        public Employee? Employee { get; set; }

        [Required]
        [MaxLength(20)]
        public string HoldingType { get; set; } = "Manual";

        public DateOnly? FromDate { get; set; }

        public DateOnly? ToDate { get; set; }

        /// <summary>Number of days to hold salary (for DaysWise type).</summary>
        public int? HoldDays { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        /// <summary>Month the holding applies to (1–12), null for multi-month holdings.</summary>
        public int? Month { get; set; }

        public int? Year { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }

        /// <summary>Active / Released / Cancelled / Reduced</summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        public DateTime? ReleasedAt { get; set; }

        [MaxLength(50)]
        public string? ReleasedByImsId { get; set; }

        [MaxLength(50)]
        public string? CreatedByImsId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
