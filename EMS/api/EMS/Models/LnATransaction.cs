using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LnATransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LnATransactionID { get; set; }

        public int LnAID { get; set; } // Foreign key to LnA

        public DateTime TransactionDate { get; set; }

        public double Amount { get; set; } // Amount paid or received

        public string TransactionType { get; set; } // e.g., "Payment", "Refund"

        public string? Description { get; set; } // Optional description of the transaction
    }
}
