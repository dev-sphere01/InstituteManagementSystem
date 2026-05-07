using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class Holiday
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HID { get; set; }

        public string HolidayName { get; set; }

        public int Year { get; set; }

        public DateTime Date { get; set; }
    }
}
