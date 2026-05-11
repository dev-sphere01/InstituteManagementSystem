using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LeaveBalance
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LeaveBalanceID { get; set; }

        public int EmpID { get; set; }

        public int LeaveMasterID { get; set; }

        public int Year { get; set; }

        public int OpeningBalance { get; set; }

        public int Availed { get; set; }

        public int Adjusted { get; set; }

        public int ClosingBalance { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? TotalAccrued { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? EncashedAmount { get; set; }

        public DateTime? LastAccrualDate { get; set; }
    }
}
