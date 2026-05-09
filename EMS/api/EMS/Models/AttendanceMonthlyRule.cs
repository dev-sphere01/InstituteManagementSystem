using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class AttendanceMonthlyRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleID { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal ThresholdMin { get; set; } // e.g., 190
        [Column(TypeName = "decimal(18,2)")]
        public decimal ThresholdMax { get; set; } // e.g., 200
        [Column(TypeName = "decimal(18,2)")]
        public decimal TargetHours { get; set; }  // e.g., 200
    }
}
