using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMS.Models
{
    /// <summary>
    /// Per-branch late fine slab configuration.
    /// Slabs are stored as JSON to keep the schema flexible.
    /// Example slabs: [{"FromCount":1,"ToCount":3,"FinePerOccurrence":0},
    ///                  {"FromCount":4,"ToCount":5,"FinePerOccurrence":50},
    ///                  {"FromCount":6,"ToCount":null,"FinePerOccurrence":100}]
    /// </summary>
    public class LateFineRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int LocationId { get; set; }

        [ForeignKey("LocationId")]
        public Location? Location { get; set; }

        /// <summary>JSON-serialised array of FineSlab objects.</summary>
        [Required]
        public string SlabsJson { get; set; } = "[]";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>DTO for deserialising slab entries from SlabsJson.</summary>
    public class FineSlab
    {
        public int FromCount { get; set; }
        public int? ToCount { get; set; }       // null = unlimited
        public decimal FinePerOccurrence { get; set; }
    }
}
