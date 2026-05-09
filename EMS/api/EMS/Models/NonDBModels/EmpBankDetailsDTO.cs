namespace EMS.Models.NonDBModels
{
    public class EmpBankDetailsDTO
    {
        public int EmpID { get; set; }

        public string? BankName { get; set; }

        public string? AccountNumber { get; set; }

        public string? IFSCCode { get; set; }

        public string? BranchName { get; set; }

        public IFormFile? CancelledCheque { get; set; }
    }
}
