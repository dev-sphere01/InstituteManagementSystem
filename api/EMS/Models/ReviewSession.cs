namespace EMS.Models
{
    public class ReviewSession
    {
        public int ReviewSessionID { get; set; }

        public string? SessionName { get; set; }

        public bool? IsLocked { get; set; }
    }
}
