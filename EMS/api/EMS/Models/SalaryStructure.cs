using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class SalaryStructure
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SalaryStructureID { get; set; }
        
        public int PositionID { get; set; }
        
        public double? MinCTC { get; set; }

        public double? MaxCTC { get; set; }

        public double? AverageCTC { get; set; }
    }
}
