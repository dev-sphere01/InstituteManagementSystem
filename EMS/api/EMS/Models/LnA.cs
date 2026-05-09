using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LnA
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]   
        public int LnAID { get; set; }

        public int EmpID { get; set; }

        public double? LoanAmount { get; set; }

        public int? Period { get; set; } // in months

        public double? InterestRate { get; set; } = 0.0d; // annual interest rate

        public double? MonthlyInstallment { get; set; }

        public DateTime? StartDate { get; set; }
        public bool? IsApproved { get; set; }
        public string? Description { get; set; }

        public int? IsApprovedBy { get; set; }

        public bool? IsArrearOrAdvance { get; set; }

        public bool? isForceClosed { get; set; } = false;

        public bool? isPaused { get; set; } = false;

        public DateTime? UpdatedAt { get; set; }

        public int? UpdatedBy { get; set; }
    }
}
