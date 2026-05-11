using Humanizer.Localisation.DateToOrdinalWords;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class RandomAssessment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RAID { get; set; }

        public int? AssessorID { get; set; }

        public List<int>? AssesseeIDs { get; set; }

        public int? Month { get; set; }

        public int? Year { get; set; }

        public int RSID { get; set; }
    }
}
