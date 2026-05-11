using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpDoc
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmpDocId { get; set; }

        public int EmpId { get; set; }

        public string? DocName { get; set; }

        public string? DocIDNumber { get; set; }

        public string? DocPath { get; set; }

    }
}
