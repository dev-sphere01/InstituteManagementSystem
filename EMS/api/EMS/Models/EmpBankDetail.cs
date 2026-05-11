using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpBankDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EbdID { get; set; }

        public int EmpID { get; set; }
        
        public string? BankName { get; set; }

        public string? AccountNumber { get; set; }

        public string? IFSCCode { get; set; }

        public string? BranchName { get; set; }

        public string? CancelledCheque { get; set; }

        public string? UAN { get; set; }
    }
}
