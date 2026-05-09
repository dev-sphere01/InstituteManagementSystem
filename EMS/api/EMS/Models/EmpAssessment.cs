using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EMS.Models
{
    public class EmpAssessment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EAID { get; set; }

        public int? EmpID { get; set; }

        public int? SelfDevelopment { get; set; }

        public int? EmployeeStaffDevelopment { get; set; }

        public int? DecisionMaking { get; set; }

        public int? ProductivityEfficiency { get; set; }

        public int? CallForDuty { get; set; }

        public double? PerformanceScore { get; set; }

        public int? AttendancePunctuality { get; set; }

        public int? BehaviourOverallDiscipline { get; set; }

        public double? DisciplineScore { get; set; }

        public int? Integrity { get; set; }

        public int? LoyaltySubmissionToCompanyGoals { get; set; }

        public double? IntegrityScore { get; set; }

        public double? FinalPercentage { get; set; }

        public DateTime? SubmittedAt { get; set; }

        public int? Month { get; set; }

        public int? Year { get; set; }

        public int? SubmittedBy { get; set; }

        public int? RSID { get; set; }

        public string? FinalRemark { get; set;}

        public bool IsLocked { get; set; } = false;

        public string? Rating { get; set; }
    }
}
