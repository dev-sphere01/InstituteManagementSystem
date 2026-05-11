using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Individual fine/deduction records for an employee in a given month.
    /// FineType "AutoLate" is system-generated during payroll processing;
    /// "Manual" is entered by HR (e.g., uniform issue, ID card missing).
    /// </summary>
    public class EmployeeFine
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

        /// <summary>"AutoLate" (system-generated) or "Manual" (HR-entered).</summary>
        [Required]
        [MaxLength(20)]
        public string FineType { get; set; } = "Manual";

        [MaxLength(500)]
        public string? Reason { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(50)]
        public string? CreatedByImsId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
