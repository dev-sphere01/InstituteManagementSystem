using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class MonthlyPayrollTransaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MptID { get; set; }

    public int EmpID { get; set; }

    public int Month { get; set; } 

    public int Year { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BasicSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? HRA { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DA { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Advances { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? EPF { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? esi { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? RD { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? HealthInsurance { get; set; }
        
    [Column(TypeName = "decimal(18,2)")]
    public decimal? LoanAndAdvanceRepayment { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Deductions { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? OtherAllowances { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Penalty { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? NetPay { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Arrears { get; set; }

    public string? ArrearID { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TotalHours { get; set; }


    public DateTime TransactionDate { get; set; } = DateTime.Now;
}
