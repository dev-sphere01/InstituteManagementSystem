namespace EMS.Models.NonDBModels
{
    public class EMPDocDTO
    {
        public int EmpId { get; set; }

        public string? DocName { get; set; }

        public string? DocIDNumber { get; set; }

        public IFormFile? DocFile { get; set; }
    }
}
