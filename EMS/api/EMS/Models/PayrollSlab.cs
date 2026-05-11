using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class PayrollSlab
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SlabID { get; set; }

        public int MinHours { get; set; }   // e.g. 400
        public int? MaxHours { get; set; }  // null means "no upper limit"
        public int Multiplier { get; set; } // how many times basic salary
        public bool IsFlatBasic { get; set; } // true if it's just BasicSalary without extra formula
        public bool IsPenalty { get; set; }   // true if subtracting
        public string Description { get; set; }
    }
}
