using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class Penalty
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PID { get; set; }

        public int EmpID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Amount { get; set; }

        public string? Description { get; set; }

        public DateTime DeductionDate { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.Now;
    }
}
