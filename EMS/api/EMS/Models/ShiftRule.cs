using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Per-branch shift timing and late/half-day thresholds.
    /// One record per Location (branch).
    /// </summary>
    public class ShiftRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>One-to-one with Location (branch).</summary>
        [Required]
        public int LocationId { get; set; }

        [ForeignKey("LocationId")]
        public Location? Location { get; set; }

        [MaxLength(100)]
        public string ShiftName { get; set; } = "Morning";

        /// <summary>Shift start time as "HH:mm" string, e.g., "10:00".</summary>
        [Required]
        [MaxLength(5)]
        public string ShiftStart { get; set; } = "10:00";

        /// <summary>
        /// Minutes after shift start before which arrival = Present.
        /// E.g., 0 means 10:00 exactly is On Time; 1 means up to 10:01 is On Time.
        /// </summary>
        public int GracePeriodMins { get; set; } = 0;

        /// <summary>
        /// Minutes after shift start (above grace) that count as Late.
        /// E.g., 15 means arrivals 10:01–10:15 = Late.
        /// </summary>
        public int LateThresholdMins { get; set; } = 15;

        /// <summary>
        /// Minutes after shift start that counts as Half Day.
        /// E.g., 60 means arrivals from 10:16–11:00 = HalfDay.
        /// </summary>
        public int HalfDayThresholdMins { get; set; } = 60;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
