using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpDeptPos
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EdpID { get; set; }

        public int EmpID { get; set; }

        public int DeptID { get; set; }

        public int PositionID { get; set; }

        public int? EmpTypeID { get; set; }
    }
}
