using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LeaveTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LeaveTransactionID { get; set; }
        public int EmpID { get; set; }

        public int LeaveMasterID { get; set; }
        
        public DateTime LeaveDate { get; set; }
        
        public string TransactionType { get; set; } = "Debit"; // Debit (availed), Credit (encashment/adjustment)
        
        public int Days { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
