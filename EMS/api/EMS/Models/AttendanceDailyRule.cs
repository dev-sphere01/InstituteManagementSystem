using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class AttendanceDailyRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleID { get; set; }
        public int LocationID { get; set; } // 1: Office, 2: Factory
        public int? EmpType { get; set; }   // 1: Fixed, 2: Variable/Wages
        
        public TimeSpan MinHours { get; set; }

        public TimeSpan? MaxHours { get; set; } // Use null for "or more" (e.g., >= 16)

        public TimeSpan RewardedHours { get; set; }
    }
}
