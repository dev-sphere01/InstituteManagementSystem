using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class Docs
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DocID { get; set; }

        public string DocName { get; set; }

        public bool isRequired { get; set; }

        public bool isDocIDNumRequired { get; set; }

    }
}
