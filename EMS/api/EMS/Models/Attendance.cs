using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace EMS.Models
{
    public class Attendance
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AttendaceID { get; set; }

        public int? AtdEmpCode { get; set; }

        public int? LocationID { get; set; }

        public DateTime? Date { get; set; }

        public TimeOnly? CheckInTime { get; set; }

        public TimeOnly? CheckOutTime { get; set; } 

        public TimeSpan? TotalHours { get; set; }

        public TimeSpan? StandardizedHours { get; set; }

        public int? OnDutyHours { get; set; }

        public int? EmpID { get; set; }
    }
}
