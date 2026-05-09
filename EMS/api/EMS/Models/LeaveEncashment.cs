using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LeaveEncashment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EncashmentID { get; set; }

        public int EmpID { get; set; }

        public int LeaveMasterID { get; set; }

        public int Year { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal LeaveBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EncashmentAmount { get; set; }

        public DateTime EncashmentDate { get; set; }

        public string Status { get; set; } = "Processed";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
