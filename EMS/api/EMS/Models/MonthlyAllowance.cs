using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Per-employee monthly allowances and extra earnings.
    /// One record per employee per month/year (upsert pattern).
    /// </summary>
    public class MonthlyAllowance
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

        [Column(TypeName = "decimal(18,2)")]
        public decimal Travel { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Food { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Mobile { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Other { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Bonus { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal OtherIncome { get; set; } = 0;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string? UpdatedByImsId { get; set; }
    }
}
