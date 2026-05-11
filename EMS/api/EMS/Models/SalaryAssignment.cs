using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Simple monthly salary assignment per employee.
    /// Separate from the CTC-based EmpCTCandPayroll model.
    /// Multiple records per employee form a history; IsActive = true marks the current salary.
    /// </summary>
    public class SalaryAssignment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int EmpID { get; set; }

        [ForeignKey("EmpID")]
        public Employee? Employee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlySalary { get; set; }

        [Required]
        public DateOnly EffectiveDate { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(50)]
        public string? CreatedByImsId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
