using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class OfflinePayroll
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OfflineID { get; set; }

        public int EmpID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? BasicSalary { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SalaryAsPerHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ESI { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EPF { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RD { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Advances { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Deductions { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? NetPay { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Hours { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }
    }
}
