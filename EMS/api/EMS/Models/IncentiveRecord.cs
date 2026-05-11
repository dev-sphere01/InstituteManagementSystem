using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Incentive records tracked separately from the main payroll.
    /// Total = Quantity × Rate (stored computed for reporting convenience).
    /// Multiple entries allowed per employee per month.
    /// </summary>
    public class IncentiveRecord
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

        /// <summary>Incentive program name, e.g., "Spoken English", "Tally Batch".</summary>
        [Required]
        [MaxLength(200)]
        public string Program { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Rate { get; set; }

        /// <summary>Computed as Quantity × Rate. Stored for query performance.</summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [MaxLength(50)]
        public string? CreatedByImsId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
