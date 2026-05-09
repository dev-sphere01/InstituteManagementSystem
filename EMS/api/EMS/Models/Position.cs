using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class Position
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PositionID { get; set; }

        public int DeptID { get; set; }

        public string PositionName { get; set; }

        public List<int>? ReportsTo { get; set; }

        public List<string>? Permissions { get; set; }
    }
}
