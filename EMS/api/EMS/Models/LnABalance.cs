using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LnABalance
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LnABalanceID { get; set; }

        public int LnAID { get; set; } // Leave and Advance ID

        public int EmpID { get; set; }

        public int Month { get; set; } // e.g., "January"

        public int Year { get; set; }

        public double? OpeningBalance { get; set; }

        public double? ClosingBalance { get; set; }

        public double? AmountRecovered { get; set; }
    }
}
