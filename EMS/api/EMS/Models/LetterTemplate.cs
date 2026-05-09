using System.ComponentModel.DataAnnotations;

namespace EMS.Models
{
    public class LetterTemplate
    {
        [Key]
        public int TemplateID { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Content { get; set; } // HTML Content

        [Required]
        public string Language { get; set; } // English or Hindi

        public string Type { get; set; } = "IncrementLetter"; // Default to IncrementLetter
        
        public bool IsActive { get; set; } = true;
    }
}
