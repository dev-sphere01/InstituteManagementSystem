namespace EMS.Models
{
    public class Leave
    {
        public int LeaveID { get; set; }

        public int EmpID { get; set; }

        public string? LeaveType { get; set; }

        public string? LeaveReason { get; set; }

        public bool? IsApproved { get; set; }

        public bool? IsInformed { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.Now;

        public int? ApprovedbyEmpID { get; set; }

        public string? RejectionReason { get; set; }

        public int? OnDutyHours { get; set; }

        public string? Attachment { get; set; }
    }
}
