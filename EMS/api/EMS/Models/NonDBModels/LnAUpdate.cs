namespace EMS.Models.NonDBModels
{
    public class LnAUpdate
    {
        public int LnAID { get; set; }

        public bool? isLoanAmountChanged { get; set; }

        public double? AdditionAmount { get; set; }

        public bool? isInstallmentChanged { get; set; }

        public double? NewMonthlyInstallment { get; set; }

        public DateTime? EffectiveDate { get; set; }
    }
}
