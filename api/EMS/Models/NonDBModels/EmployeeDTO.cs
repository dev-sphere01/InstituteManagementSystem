using System.ComponentModel.DataAnnotations;

namespace EMS.Models.NonDBModels
{
    public class EmployeeDTO
    {
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

        public int DeptID { get; set; }

        public int PositionID { get; set; }

        public int? EmpTypeID { get; set; }

        public int RoleID { get; set; }

        public int? LocationID { get; set; }

        public int? AtdEmpCode { get; set; }
    }
}
