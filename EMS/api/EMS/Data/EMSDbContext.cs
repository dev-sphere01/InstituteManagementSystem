using Microsoft.EntityFrameworkCore;
using EMS.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace EMS.Data
{
    public class EMSDbContext : DbContext
    {
        public EMSDbContext(DbContextOptions<EMSDbContext> options) : base(options)
        {

        }

        public DbSet<Employee> Employees { get; set; } 
        public DbSet<EmpAcadDetail> EmpAcadDetails { get; set; }
        public DbSet<EmpProfDetail> EmpProfDetails { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<EmpBankDetail> EmpBankDetails { get; set; }
        public DbSet<LnABalance> LnABalances { get; set; }
        public DbSet<LnA> LnAs { get; set; }
        public DbSet<LnATransaction> LnATransactions { get; set; }
        public DbSet<MonthlyPayrollTransaction> MonthlyPayrollTransactions { get; set; }
        public DbSet<SalaryStructure> SalaryStructures { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<EmpDeptPos> EmpDeptPositions { get; set; }
        public DbSet<EmpCred> EmpCreds { get; set; }
        public DbSet<EmpAssets> EmpAssets { get; set; }
        public DbSet<EmpUnderTaking> EmpUnderTakings { get; set; }
        public DbSet<EmpDoc> EmpDocs { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<EmpCTCandPayroll> EmpCTCandPayrolls { get; set; }
        public DbSet<EmpType> EmpTypes { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Docs> Docs { get; set; }
        public DbSet<LeaveMaster>LeaveMasters { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }
        public DbSet<LeaveTransaction> LeaveTransactions { get; set; }
        public DbSet<PayrollSlab> PayrollSlabs { get; set; }
        public DbSet<AttendanceTotalHours> AttendanceTotalHours { get; set; }
        public DbSet<Penalty> Penalties { get; set; }
        public DbSet<OtherAllowance> OtherAllowances{ get; set; }
        public DbSet<EmpSelfAssessment> EmpSelfAssessments { get; set; }
        public DbSet<EmpAssessment> EmpAssessments { get; set; }
        public DbSet<RandomAssessment> RandomAssessments { get; set; }
        public DbSet<ReviewParameter> ReviewParameters { get; set; }
        public DbSet<ReviewSession> ReviewSessions { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<LeaveEncashment> LeaveEncashments { get; set; }
        public DbSet<WeeklyOffConfiguration> WeeklyOffConfigurations { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<EmpIncrement> EmpIncrements { get; set; }
        public DbSet<LetterTemplate> LetterTemplates { get; set; }
        public DbSet<SignatorySetting> SignatorySettings { get; set; }

        public DbSet<AttendanceDailyRule> AttendanceDailyRules { get; set; }
        public DbSet<AttendanceMonthlyRule> AttendanceMonthlyRules { get; set; }
        public DbSet<UserActivityLog> UserActivityLogs { get; set; }
        public DbSet<OfflinePayroll> OfflinePayrolls { get; set; }

        // ── New Payroll Module Tables ─────────────────────────────────────────
        public DbSet<PayrollHoliday> PayrollHolidays { get; set; }
        public DbSet<ShiftRule> ShiftRules { get; set; }
        public DbSet<LateFineRule> LateFineRules { get; set; }
        public DbSet<SalaryAssignment> SalaryAssignments { get; set; }
        public DbSet<MonthlyAllowance> MonthlyAllowances { get; set; }
        public DbSet<EmployeeFine> EmployeeFines { get; set; }
        public DbSet<SalaryHolding> SalaryHoldings { get; set; }
        public DbSet<SimplePayroll> SimplePayrolls { get; set; }
        public DbSet<IncentiveRecord> IncentiveRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Additional model configurations can be added here
            var reportsToConverter = new ValueConverter<List<int>, string>(
        v => JsonSerializer.Serialize(v, new JsonSerializerOptions()), // ✅ no optional args
        v => string.IsNullOrEmpty(v)
            ? new List<int>()
            : JsonSerializer.Deserialize<List<int>>(v, new JsonSerializerOptions())!
    );
            /*            modelBuilder.Entity<Employee>()
                            .HasIndex(edp => edp.PersonalEmail).IsUnique();*/
            modelBuilder.Entity<Employee>()
        .Property(e => e.ReportsTo)
        .HasConversion(reportsToConverter);

            modelBuilder.Entity<EmpAcadDetail>()
                .HasIndex(p => new {p.EmpID, p.Degree}).IsUnique();
            modelBuilder.Entity<EmpDoc>()
                .HasIndex(edp => new {edp.EmpId, edp.DocName}).IsUnique();
/*            modelBuilder.Entity<MonthlyPayrollTransaction>()
                .HasIndex(p => new { p.EmpID, p.Month, p.Year }).IsUnique();*/

            modelBuilder.Entity<EmpAssessment>()
                .HasIndex(e => new { e.EmpID, e.Month, e.Year, e.SubmittedAt }).IsUnique();

            modelBuilder.Entity<AttendanceTotalHours>()
                .HasIndex(a => new { a.EmpID, a.Month, a.Year }).IsUnique();
            modelBuilder.Entity<EmpIncrement>()
                .HasIndex(e => new { e.EmpID, e.SessionID }).IsUnique();

            // New payroll module constraints
            modelBuilder.Entity<PayrollHoliday>()
                .HasIndex(h => new { h.Date, h.LocationId }).IsUnique();

            modelBuilder.Entity<ShiftRule>()
                .HasIndex(s => s.LocationId).IsUnique();

            modelBuilder.Entity<LateFineRule>()
                .HasIndex(l => l.LocationId).IsUnique();

            modelBuilder.Entity<MonthlyAllowance>()
                .HasIndex(a => new { a.EmpID, a.Month, a.Year }).IsUnique();

            modelBuilder.Entity<SimplePayroll>()
                .HasIndex(p => new { p.EmpID, p.Month, p.Year }).IsUnique();
        }
    }

}
