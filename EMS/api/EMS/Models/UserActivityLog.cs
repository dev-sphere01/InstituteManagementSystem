using System;
using System.ComponentModel.DataAnnotations;

namespace EMS.Models
{
    public class UserActivityLog
    {
        [Key]
        public int Id { get; set; }

        public string ActionCategory { get; set; } // e.g., "Payroll", "Employee Profile"
        
        public string Action { get; set; } // e.g., "Update CTC", "Create Employee"
        
        public string Description { get; set; } // Human readable summary

        public string? OldValue { get; set; } // JSON or string of data before change
        
        public string? NewValue { get; set; } // JSON or string of data after change

        public int TriggeredBy { get; set; } // EmpID of the user who performed the action

        public string InWhichController { get; set; } // Name of the controller

        public string OnWhichEmployee { get; set; } // Target EmpID or "all" for bulk

        public DateTime TimeStamp { get; set; } = DateTime.Now;
    }
}
