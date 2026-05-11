using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpIncrement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IncrementID { get; set; }

        [Required]
        public int EmpID { get; set; }

        public int? EAID { get; set; } // Foreign Key to EmpAssessment (if linked to appraisal)

        public int? SessionID { get; set; } // Added for increment cycle/session

        [Column(TypeName = "decimal(18,2)")]
        public decimal PreviousCTC { get; set; }

        public DateTime? PreviousEffectiveDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal IncrementPercentage { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal IncrementAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NewCTC { get; set; }

        [Required]
        public DateTime WEFDate { get; set; }

        [Required]
        public string ApprovalStatus { get; set; } = "Pending";

        public bool IsProcessed { get; set; } = false;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ArrearsAmount { get; set; } = 0;

        public bool ArrearsPaid { get; set; } = false;

        public DateTime? ProcessedDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string? CreatedBy { get; set; }
    }
}
