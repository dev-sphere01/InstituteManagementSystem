using System.ComponentModel.DataAnnotations;

namespace EMS.Models
{
    public class SignatorySetting
    {
        [Key]
        public int SignatoryID { get; set; }

        [Required]
        public string Name { get; set; }

        public string Designation { get; set; }

        public string SignatureImagePath { get; set; } // Path to the uploaded signature image

        public bool IsDefault { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
    }
}
