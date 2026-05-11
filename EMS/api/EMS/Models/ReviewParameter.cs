using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class ReviewParameter
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReviewParameterID { get; set; }

        public string? ParameterName { get; set; }

        public string? ParameterNameHindi { get; set; }

        public string? Category { get; set; }

        public string? CategoryHindi { get; set; }

        public int? CategoryID { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal? Weightage { get; set; }

        public string? DescriptionEnglish { get; set; }

        public string? DescriptionHindi { get; set; }

        public List<string>? OptionsEnglish { get; set; }

        public List<string>? OptionsHindi { get; set; }
    }
}
