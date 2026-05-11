using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EMS.Models
{
    public class EmpSelfAssessment
    {
        [Key]
        public int ESAID { get; set; }
        public int? EmpID { get; set; }

        // Self Assessment Section
        public string? Achievements { get; set; }
        public string? GoalsObjectives { get; set; }
        public string? TechnicalChallenges { get; set; }
        public string? NewIdeas { get; set; }
        public string? TeamContribution { get; set; }
        public string? Feedback { get; set; }
        public string? SkillsLearned { get; set; }
        public string? KeyFeedback { get; set; }
        public string? PersonalGrowth { get; set; }
        public string? PriorityManagement { get; set; }
        public string? Engagement { get; set; }
        public string? WorkSatisfaction { get; set; }
        public string? CompanyObjectives { get; set; }
        public string? FutureGrowth { get; set; }
        public string? SupportNeeded { get; set; }
        public string? Suggestions { get; set; }

        // Ratings Section
        public int? TechnicalCompetenceRating { get; set; }
        public string? TechnicalCompetenceComments { get; set; }

        public int? ProblemSolvingRating { get; set; }
        public string? ProblemSolvingComments { get; set; }

        public int? CommunicationRating { get; set; }
        public string? CommunicationComments { get; set; }

        public int? TeamCollaborationRating { get; set; }
        public string? TeamCollaborationComments { get; set; }

        public int? OwnershipAccountabilityRating { get; set; }
        public string? OwnershipAccountabilityComments { get; set; }

        public int? SpeedDeliveryRating { get; set; }
        public string? SpeedDeliveryComments { get; set; }

        public int? InnovationCreativityRating { get; set; }
        public string? InnovationCreativityComments { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }
}
