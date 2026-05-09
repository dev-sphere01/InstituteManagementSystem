using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpAcadDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EadID { get; set; }

        public int EmpID { get; set; }

        public string? Degree { get; set; }

        public string? Qualification { get; set; }

        public string? Institution { get; set; }

        public string? YearOfPassing { get; set; }

        public string? Grade { get; set; }
    }
}
