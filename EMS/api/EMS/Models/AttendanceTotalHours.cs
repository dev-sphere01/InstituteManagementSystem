using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class AttendanceTotalHours
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AthID { get; set; }

        public int EmpID { get; set; }

        public int Year { get; set; }

        public int Month { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal ActualTotalHours { get; set; }
        [Column(TypeName = "decimal(18,2)")]// Sum of actual daily hours
        public decimal StandardizedTotalHours { get; set; } // Sum of standardized + monthly rounding

        [Obsolete("Use ActualTotalHours or StandardizedTotalHours")]
        public int TotalHours { get; set; }

    }
}
