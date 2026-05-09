using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Branch-specific holidays for the new attendance-based payroll system.
    /// Separate from the existing Holiday model (which is tied to leave management).
    /// </summary>
    public class PayrollHoliday
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        /// <summary>LocationId references the existing Location table (branch).</summary>
        [Required]
        public int LocationId { get; set; }

        [ForeignKey("LocationId")]
        public Location? Location { get; set; }

        /// <summary>
        /// If true, employees who work on this holiday earn holiday pay (extra daily salary).
        /// </summary>
        public bool IsWorkingDay { get; set; } = false;

        /// <summary>IMS MongoDB user ObjectId of the creator (for audit).</summary>
        [MaxLength(50)]
        public string? CreatedByImsId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
