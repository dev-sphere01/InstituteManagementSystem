namespace EMS.Models.NonDBModels
{
    public class EmpProfDetailDTO
    {
        public int EmpID { get; set; }

        public string? PreviousCompany { get; set; }

        public string? PreviousPosition { get; set; }

        public string? PreviousExperience { get; set; }

        public IFormFile PrevExpCert { get; set; }
    }
}
