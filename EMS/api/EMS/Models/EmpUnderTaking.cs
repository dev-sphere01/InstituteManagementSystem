namespace EMS.Models
{
    public class EmpUnderTaking
    {
        public int EmpUnderTakingID { get; set; }

        public int EmpID { get; set; }

        public string UndertakingType { get; set; }

        public string UndertakingText { get; set; } // html of whole unndertaking letter

        public string? UndertakingFilePath { get; set; }
        //stores the undertaking text

    }
}
