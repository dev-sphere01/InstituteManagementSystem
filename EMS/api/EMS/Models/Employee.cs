using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    public class Employee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmpID { get; set; }

        [Required]
        public string FirstName { get; set; }

        public string? LastName { get; set; }

        public string? PersonalEmail { get; set; }

        public string? WorkEmail { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public string? EmergencyContact { get; set; }

        public string? EmergencyContactNumber { get; set; }

        public string? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? DateOfJoining { get; set; }

        public bool OBStatus { get; set; }

        public bool IsActive { get; set; }

        public string? ProfilePicture { get; set; }

        public string? Signature { get; set; }

        public int RoleID { get; set; }

        public int? LocationID { get; set; }

        public int? AtdEmpCode { get; set; }

        public List<int>? ReportsTo { get; set; }

        public bool? IsProbationComplete { get; set; }

        public string? Grade { get; set; }

        public DateTime? DateofLeaving { get; set; }

        public string? TerminateReasonOrLeavingReason { get; set; }

        public DateTime? DateofRehire { get; set; }

    }
}
