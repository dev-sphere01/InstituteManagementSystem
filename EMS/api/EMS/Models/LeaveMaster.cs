using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class LeaveMaster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LeaveMasterID { get; set; }

        public string LeaveType { get; set; } = string.Empty;

        public int AnnualQuota { get; set; }

        public bool IsEncashable { get; set; }

        public bool IsCarryForward { get; set; }

        public int MaxCarryForward { get; set; }
    }
}
