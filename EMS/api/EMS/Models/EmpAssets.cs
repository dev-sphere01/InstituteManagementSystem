using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpAssets
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmpAssetID { get; set; }

        public int EmpID { get; set; }

        public string AssetName { get; set; }

        public bool IsReturned { get; set; }

        public bool IsReceived { get; set; }
    }
}
