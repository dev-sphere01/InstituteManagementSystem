using DocumentFormat.OpenXml.Presentation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class EmpProfDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EpdID { get; set; }

        public int EmpID { get; set; }

        public string? PreviousCompany { get; set; }

        public string? PreviousPosition { get; set; }

        public string ? PreviousExperience { get; set; }

        public string? PreviousExperienceCeritificate { get; set; }
    }
}
