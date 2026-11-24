using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using EMS.Data;
using EMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public ReportsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/reports/AvailableFields
        [HttpGet("AvailableFields")]
        public async Task<IActionResult> AvailableFields()
        {
            try
            {
                var availableFields = new
                {
                    Employee = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "EmpID", Label = "Employee ID" },
                        new FieldDefinition { Key = "EmployeeName", Label = "Employee Name" },
                        new FieldDefinition { Key = "EmployeeCode", Label = "Employee Code" },
                        new FieldDefinition { Key = "FirstName", Label = "First Name" },
                        new FieldDefinition { Key = "LastName", Label = "Last Name" },
                        new FieldDefinition { Key = "WorkEmail", Label = "Work Email" },
                        new FieldDefinition { Key = "PersonalEmail", Label = "Personal Email" },
                        new FieldDefinition { Key = "PhoneNumber", Label = "Phone Number" },
                        new FieldDefinition { Key = "EmergencyContact", Label = "Emergency Contact" },
                        new FieldDefinition { Key = "EmergencyContactNumber", Label = "Emergency Contact Number" },
                        new FieldDefinition { Key = "DateOfJoining", Label = "Date of Joining" },
                        new FieldDefinition { Key = "DateOfBirth", Label = "Date of Birth" },
                        new FieldDefinition { Key = "Gender", Label = "Gender" },
                        new FieldDefinition { Key = "Address", Label = "Address" },
                        new FieldDefinition { Key = "Status", Label = "Status" },
                        new FieldDefinition { Key = "OBStatus", Label = "OB Status" },
                        new FieldDefinition { Key = "Department", Label = "Department" },
                        new FieldDefinition { Key = "Designation", Label = "Designation" },
                        new FieldDefinition { Key = "EmploymentType", Label = "Employment Type" },
                        new FieldDefinition { Key = "Location", Label = "Location" },
                        new FieldDefinition { Key = "Role", Label = "Role" },
                        new FieldDefinition { Key = "ReportingManagers", Label = "Reporting Managers"},
                        new FieldDefinition { Key = "AtdEmpCode", Label = "Attendance Employee Code" },
                        new FieldDefinition { Key = "DateofLeaving", Label = "Date of Leaving" },
                        new FieldDefinition { Key = "DateofRehire", Label = "Date of Rehire" },
                        new FieldDefinition { Key = "TerminateReasonOrLeavingReason", Label = "Terminate Reason Or Leaving Reason" }
                    },

                    Payroll = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "BasicSalary", Label = "Basic Salary" },
                        new FieldDefinition { Key = "HRA", Label = "HRA" },
                        new FieldDefinition { Key = "DA", Label = "DA" },
                        new FieldDefinition { Key = "GrossSalary", Label = "Gross Salary" },
                        new FieldDefinition { Key = "Advances", Label = "Advances" },
                        new FieldDefinition { Key = "EPF", Label = "EPF" },
                        new FieldDefinition { Key = "ESI", Label = "ESI" },
                        new FieldDefinition { Key = "RD", Label = "Recurring Deposit" },
                        new FieldDefinition { Key = "HealthInsurance", Label = "Health Insurance" },
                        new FieldDefinition { Key = "LoanAndAdvanceRepayment", Label = "Loan & Advance Repayment" },
                        new FieldDefinition { Key = "Deductions", Label = "Total Deductions" },
                        new FieldDefinition { Key = "Penalty", Label = "Penalty" },
                        new FieldDefinition { Key = "OtherAllowances", Label = "Other Allowances" },
                        new FieldDefinition { Key = "NetSalary", Label = "Net Salary" },
                        new FieldDefinition { Key = "TotalHours", Label = "Total Hours Worked" },
                        new FieldDefinition { Key = "Month", Label = "Month" },
                        new FieldDefinition { Key = "Year", Label = "Year" },
                        new FieldDefinition { Key = "TransactionDate", Label = "Transaction Date" }
                    },

                    Appraisal = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "AppraisalDate", Label = "Appraisal Date" },
                        new FieldDefinition { Key = "SelfDevelopment", Label = "Self Development" },
                        new FieldDefinition { Key = "EmployeeStaffDevelopment", Label = "Employee Staff Development" },
                        new FieldDefinition { Key = "DecisionMaking", Label = "Decision Making" },
                        new FieldDefinition { Key = "ProductivityEfficiency", Label = "Productivity & Efficiency" },
                        new FieldDefinition { Key = "CallForDuty", Label = "Call for Duty" },
                        new FieldDefinition { Key = "PerformanceScore", Label = "Performance Score" },
                        new FieldDefinition { Key = "AttendancePunctuality", Label = "Attendance & Punctuality" },
                        new FieldDefinition { Key = "BehaviourOverallDiscipline", Label = "Behaviour & Overall Discipline" },
                        new FieldDefinition { Key = "DisciplineScore", Label = "Discipline Score" },
                        new FieldDefinition { Key = "Integrity", Label = "Integrity" },
                        new FieldDefinition { Key = "LoyaltySubmissionToCompanyGoals", Label = "Loyalty & Submission to Company Goals" },
                        new FieldDefinition { Key = "IntegrityScore", Label = "Integrity Score" },
                        new FieldDefinition { Key = "FinalScore", Label = "Final Score" },
                        new FieldDefinition { Key = "Rating", Label = "Final Rating" },
                        new FieldDefinition { Key = "Comments", Label = "Comments" },
                        new FieldDefinition { Key = "ReviewedBy", Label = "Reviewed By" },
                        new FieldDefinition { Key = "Month", Label = "Month" },
                        new FieldDefinition { Key = "Year", Label = "Year" },
                        new FieldDefinition { Key = "IsLocked", Label = "Is Locked" }
                    },

                    Qualification = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "Degree", Label = "Degree" },
                        new FieldDefinition { Key = "Qualification", Label = "Qualification" },
                        new FieldDefinition { Key = "Institution", Label = "Institution" },
                        new FieldDefinition { Key = "YearOfPassing", Label = "Year of Passing" },
                        new FieldDefinition { Key = "Grade", Label = "Grade/Percentage" }
                    },

                    Leave = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "LeaveID", Label = "Leave ID" },
                        new FieldDefinition { Key = "LeaveType", Label = "Leave Type" },
                        new FieldDefinition { Key = "LeaveReason", Label = "Leave Reason" },
                        new FieldDefinition { Key = "StartDate", Label = "Start Date" },
                        new FieldDefinition { Key = "EndDate", Label = "End Date" },
                        new FieldDefinition { Key = "CreatedAt", Label = "Created Date" },
                        new FieldDefinition { Key = "IsApproved", Label = "Is Approved" },
                        new FieldDefinition { Key = "ApprovedBy", Label = "Approved By" },
                        new FieldDefinition { Key = "RejectionReason", Label = "Rejection Reason" },
                        new FieldDefinition { Key = "OnDutyHours", Label = "On Duty Hours" }
                    },

                    LeaveBalance = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "LeaveType", Label = "Leave Type" },
                        new FieldDefinition { Key = "Year", Label = "Year" },
                        new FieldDefinition { Key = "OpeningBalance", Label = "Opening Balance" },
                        new FieldDefinition { Key = "Availed", Label = "Availed" },
                        new FieldDefinition { Key = "Adjusted", Label = "Adjusted" },
                        new FieldDefinition { Key = "ClosingBalance", Label = "Closing Balance" }
                    },

                    LoanAndAdvance = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "LnAID", Label = "Loan ID" },
                        new FieldDefinition { Key = "LoanAmount", Label = "Loan Amount" },
                        new FieldDefinition { Key = "Period", Label = "Period (Months)" },
                        new FieldDefinition { Key = "InterestRate", Label = "Interest Rate (%)" },
                        new FieldDefinition { Key = "MonthlyInstallment", Label = "Monthly Installment" },
                        new FieldDefinition { Key = "StartDate", Label = "Start Date" },
                        new FieldDefinition { Key = "IsApproved", Label = "Is Approved" },
                        new FieldDefinition { Key = "ApprovedBy", Label = "Approved By" },
                        new FieldDefinition { Key = "Description", Label = "Description" },
                        new FieldDefinition { Key = "IsArrearOrAdvance", Label = "Type (Arrear/Advance)" },
                        new FieldDefinition { Key = "IsForceClosed", Label = "Is Force Closed" },
                        new FieldDefinition { Key = "IsPaused", Label = "Is Paused" },
                        new FieldDefinition { Key = "UpdatedAt", Label = "Updated Date" },
                        new FieldDefinition { Key = "UpdatedBy", Label = "Updated By" }
                    },

                    Attendance = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "Date", Label = "Attendance Date" },
                        new FieldDefinition { Key = "CheckInTime", Label = "Check In Time" },
                        new FieldDefinition { Key = "CheckOutTime", Label = "Check Out Time" },
                        new FieldDefinition { Key = "TotalHours", Label = "Total Hours" },
                        new FieldDefinition { Key = "OnDutyHours", Label = "On Duty Hours" }
                    },

                    BankDetails = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "BankName", Label = "Bank Name" },
                        new FieldDefinition { Key = "AccountNumber", Label = "Account Number" },
                        new FieldDefinition { Key = "IFSCCode", Label = "IFSC Code" },
                        new FieldDefinition { Key = "BranchName", Label = "Branch Name" },
                        new FieldDefinition { Key = "UAN", Label = "UAN" }
                    },

                    ProfessionalDetails = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "PreviousCompany", Label = "Previous Company" },
                        new FieldDefinition { Key = "PreviousPosition", Label = "Previous Position" },
                        new FieldDefinition { Key = "PreviousExperience", Label = "Previous Experience (Years)" },
                        new FieldDefinition { Key = "PreviousExperienceCertificate", Label = "Experience Certificate Available" }
                    },

                    CTC = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "CtcAmount", Label = "CTC Amount" },
                        new FieldDefinition { Key = "MonthlyBasicPay", Label = "Monthly Basic Pay" },
                        new FieldDefinition { Key = "BasicSalary", Label = "Basic Salary (Annual)" },
                        new FieldDefinition { Key = "Hra", Label = "HRA (Annual)" },
                        new FieldDefinition { Key = "Da", Label = "DA (Annual)" },
                        new FieldDefinition { Key = "Lta", Label = "LTA (Annual)" },
                        new FieldDefinition { Key = "SpecialAllowance", Label = "Special Allowance (Annual)" },
                        new FieldDefinition { Key = "PerformanceBonus", Label = "Performance Bonus (Annual)" },
                        new FieldDefinition { Key = "GrossSalary", Label = "Gross Salary (Annual)" },
                        new FieldDefinition { Key = "NetAnnualSalary", Label = "Net Annual Salary" },
                        new FieldDefinition { Key = "NetMonthlyPayable", Label = "Net Monthly Payable" },
                        new FieldDefinition { Key = "EPFEmployee", Label = "EPF Employee Contribution" },
                        new FieldDefinition { Key = "RD", Label = "Recurring Deposit" },
                        new FieldDefinition { Key = "HealthInsurance", Label = "Health Insurance" },
                        new FieldDefinition { Key = "EffectiveDate", Label = "Effective Date" }
                    },

                    Increments = new List<FieldDefinition>
                    {
                        new FieldDefinition { Key = "PreviousCTC", Label = "Previous CTC" },
                        new FieldDefinition { Key = "IncrementPercentage", Label = "Increment Percentage (%)" },
                        new FieldDefinition { Key = "IncrementAmount", Label = "Increment Amount" },
                        new FieldDefinition { Key = "NewCTC", Label = "New CTC" },
                        new FieldDefinition { Key = "WEFDate", Label = "WEF Date" },
                        new FieldDefinition { Key = "ApprovalStatus", Label = "Approval Status" },
                        new FieldDefinition { Key = "IsProcessed", Label = "Is Processed" },
                        new FieldDefinition { Key = "ArrearsAmount", Label = "Arrears Amount" },
                        new FieldDefinition { Key = "ArrearsPaid", Label = "Arrears Paid" },
                        new FieldDefinition { Key = "ProcessedDate", Label = "Processed Date" },
                        new FieldDefinition { Key = "CreatedAt", Label = "Created Date" }
                    }
                };

                return Ok(availableFields);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving available fields", details = ex.Message });
            }
        }

        // POST: api/reports/GetCustomReport
        /*[HttpPost("GetCustomReport")]
        public async Task<IActionResult> GetCustomReport([FromBody] ReportRequest request)
        {
            try
            {
                // Step 1??: Base employee query
                var employeesQuery =
                    from e in _context.Employees
                    join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
                    join d in _context.Departments on edp.DeptID equals d.DeptID
                    join p in _context.Positions on edp.PositionID equals p.PositionID
                    join loc in _context.Locations on e.LocationID equals loc.LocationID into locJoin
                    from loc in locJoin.DefaultIfEmpty()
                    join r in _context.Roles on e.RoleID equals r.RoleID into roleJoin
                    from r in roleJoin.DefaultIfEmpty()
                    where e.IsActive == true && e.EmpID != 1
                    select new
                    {
                        Employee = new
                        {
                            e.EmpID,
                            EmployeeName = e.FirstName + " " + e.LastName,
                            EmployeeCode = e.AtdEmpCode,
                            e.FirstName,
                            e.LastName,
                            e.DateOfJoining,
                            e.DateOfBirth,
                            e.Gender,
                            e.Address,
                            e.WorkEmail,
                            e.PersonalEmail,
                            e.PhoneNumber,
                            e.EmergencyContact,
                            e.EmergencyContactNumber,
                            Department = d.DeptName,
                            Designation = p.PositionName,
                            Location = loc.LocationName ?? "",
                            Role = r.RoleName ?? "",
                            e.OBStatus,
                            EmploymentType = edp.EmpTypeID == 1 ? "Fixed" : "Hourly",
                            Status = e.IsActive ? "Active" : "Inactive"
                        },
                        Payroll = _context.MonthlyPayrollTransactions
                            .Where(mp => mp.EmpID == e.EmpID)
                            .OrderByDescending(mp => mp.TransactionDate)
                            .Select(mp => new
                            {
                                mp.BasicSalary,
                                mp.HRA,
                                mp.DA,
                                GrossSalary = mp.BasicSalary + mp.HRA + mp.DA,
                                mp.Advances,
                                mp.EPF,
                                mp.esi,
                                mp.RD,
                                mp.HealthInsurance,
                                mp.LoanAndAdvanceRepayment,
                                DeductionAmount = mp.Deductions + mp.Penalty + mp.esi + mp.EPF,
                                mp.Deductions,
                                mp.Penalty,
                                mp.OtherAllowances,
                                NetSalary = mp.NetPay,
                                mp.TotalHours,
                                mp.Month,
                                mp.Year,
                                mp.TransactionDate
                            })
                            .FirstOrDefault(),
                        Appraisal = (
    from a in _context.EmpAssessments
    join reviewer in _context.Employees on a.SubmittedBy equals reviewer.EmpID into reviewerJoin
    from reviewer in reviewerJoin.DefaultIfEmpty()
    where a.EmpID == e.EmpID
    orderby a.SubmittedAt descending
    select new
    {
        AppraisalDate = a.SubmittedAt,
        a.SelfDevelopment,
        a.EmployeeStaffDevelopment,
        a.DecisionMaking,
        a.ProductivityEfficiency,
        a.CallForDuty,
        a.PerformanceScore,
        a.AttendancePunctuality,
        a.BehaviourOverallDiscipline,
        a.DisciplineScore,
        a.Integrity,
        a.LoyaltySubmissionToCompanyGoals,
        a.IntegrityScore,
        FinalScore = a.FinalPercentage,
        Rating = a.Rating ?? "",
        Comments = a.FinalRemark ?? "",
        ReviewedBy = reviewer != null ? reviewer.FirstName + " " + reviewer.LastName : "N/A",
        a.Month,
        a.Year,
        a.IsLocked
    }
).FirstOrDefault(),
                        Qualification = _context.EmpAcadDetails
                            .Where(ed => ed.EmpID == e.EmpID)
                            .OrderByDescending(ed => ed.YearOfPassing)
                            .Select(ed => new
                            {
                                Qualification = ed.Qualification,
                                ed.Degree,
                                Institute = ed.Institution,
                                ed.Institution,
                                YearOfPassing = ed.YearOfPassing,
                                Grade = ed.Grade,
                                Percentage = ed.Grade
                            })
                            .FirstOrDefault(),
                        Leaves = _context.Leaves
    .Where(l => l.EmpID == e.EmpID)
    .OrderByDescending(l => l.StartDate)
    .Select(l => new
    {
        l.LeaveID,
        l.LeaveType,
        l.LeaveReason,
        l.StartDate,
        l.EndDate,
        l.CreatedAt,
        l.IsApproved,
        ApprovedBy = l.ApprovedbyEmpID,
        l.RejectionReason,
        l.OnDutyHours
    })
    .ToList(),
                        LeaveBalances = _context.LeaveBalances
    .Where(lb => lb.EmpID == e.EmpID)
    .OrderByDescending(lb => lb.Year)
    .Select(lb => new
    {
        lb.Year,
        lb.OpeningBalance,
        lb.Availed,
        lb.Adjusted,
        lb.ClosingBalance
    })
    .ToList(),
                        LoansAndAdvances = _context.LnAs
    .Where(la => la.EmpID == e.EmpID)
    .OrderByDescending(la => la.StartDate)
    .Select(la => new
    {
        la.LnAID,
        la.LoanAmount,
        la.Period,
        la.InterestRate,
        la.MonthlyInstallment,
        la.StartDate,
        la.IsApproved,
        ApprovedBy = la.IsApprovedBy,
        la.Description,
        la.IsArrearOrAdvance,
        la.isForceClosed,
        la.isPaused,
        la.UpdatedAt,
        la.UpdatedBy
    })
    .ToList(),
                        BankDetails = _context.EmpBankDetails
                            .Where(bd => bd.EmpID == e.EmpID)
                            .Select(bd => new
                            {
                                bd.BankName,
                                bd.AccountNumber,
                                bd.IFSCCode,
                                bd.BranchName,
                                bd.UAN
                            })
                            .FirstOrDefault(),
                        ProfessionalDetails = _context.EmpProfDetails
                            .Where(pd => pd.EmpID == e.EmpID)
                            .Select(pd => new
                            {
                                pd.PreviousCompany,
                                pd.PreviousPosition,
                                pd.PreviousExperience,
                                PreviousExperienceCertificate = pd.PreviousExperienceCeritificate
                            })
                            .FirstOrDefault()
                    };

                // Step 2??: Execute the query
                var result = await employeesQuery.ToListAsync();

                // Step 3??: Filter by date if provided
                if (request.StartDate.HasValue && request.EndDate.HasValue)
                {
                    result = result
                        .Where(x =>
                        {
                            if (DateTime.TryParse(x.Employee.DateOfJoining?.ToString(), out var doj))
                            {
                                return doj.Date >= request.StartDate.Value.Date && doj.Date <= request.EndDate.Value.Date;
                            }
                            return false;
                        })
                        .ToList();
                }

                // Step 4??: Convert each record to dynamic object using selected fields
                var data = result.Select(x => BuildDynamicObject(x, request.Fields)).ToList();

                // Step 5??: Return either JSON or Excel
                if (request.Format?.ToLower() == "excel")
                {
                    var headers = request.Fields;
                    return ExportToExcel(data, headers);
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating custom report", details = ex.Message });
            }
        }
*/

        [HttpPost("GetCustomReport")]
        public async Task<IActionResult> GetCustomReport([FromBody] ReportRequest request)
        {
            try
            {
                // ?? Step 0??: Build a dictionary for employee names (EmpID ? FullName)
                var employeeDictionary = await _context.Employees
            .ToDictionaryAsync(e => e.EmpID, e => e.FirstName + " " + (e.LastName ?? ""));

                bool active = request.Status?.ToLower() == "active";
                // Step 1??: Base employee query
                var employeesQuery =
                    from e in _context.Employees
                    join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
                    join d in _context.Departments on edp.DeptID equals d.DeptID
                    join p in _context.Positions on edp.PositionID equals p.PositionID
                    join loc in _context.Locations on e.LocationID equals loc.LocationID into locJoin
                    from loc in locJoin.DefaultIfEmpty()
                    join r in _context.Roles on e.RoleID equals r.RoleID into roleJoin
                    from r in roleJoin.DefaultIfEmpty()
                    where e.IsActive == active && e.EmpID != 1
                    select new
                    {
                        e.EmpID,
                        Employee = new
                        {
                            e.EmpID,
                            EmployeeName = e.FirstName + " " + e.LastName,
                            EmployeeCode = e.AtdEmpCode,
                            e.FirstName,
                            e.LastName,
                            e.DateOfJoining,
                            e.DateOfBirth,
                            e.Gender,
                            e.Address,
                            e.WorkEmail,
                            e.PersonalEmail,
                            e.PhoneNumber,
                            e.EmergencyContact,
                            e.EmergencyContactNumber,
                            Department = d.DeptName,
                            Designation = p.PositionName,
                            Location = loc.LocationName ?? "",
                            Role = r.RoleName ?? "",
                            e.OBStatus,
                            EmploymentType = edp.EmpTypeID == 1 ? "Fixed" : (edp.EmpTypeID == 2 ? "Hourly" : "Not Specified"),
                            Status = e.IsActive ? "Active" : "Inactive",
                            DateofLeaving = e.DateofLeaving,
                            DateofRehire = e.DateofRehire,
                            TerminateReasonOrLeavingReason = e.TerminateReasonOrLeavingReason
                        },
                        Payroll = _context.MonthlyPayrollTransactions
                            .Where(mp => mp.EmpID == e.EmpID)
                            .OrderByDescending(mp => mp.TransactionDate)
                            .Select(mp => new
                            {
                                mp.BasicSalary,
                                mp.HRA,
                                mp.DA,
                                GrossSalary = mp.BasicSalary + mp.HRA + mp.DA,
                                mp.Advances,
                                mp.EPF,
                                mp.esi,
                                mp.RD,
                                mp.HealthInsurance,
                                mp.LoanAndAdvanceRepayment,
                                DeductionAmount = mp.Deductions + mp.Penalty + mp.esi + mp.EPF,
                                mp.Deductions,
                                mp.Penalty,
                                mp.OtherAllowances,
                                NetSalary = mp.NetPay,
                                mp.TotalHours,
                                mp.Month,
                                mp.Year,
                                mp.TransactionDate
                            })
                            .FirstOrDefault(),
                        Appraisal = (
                            from a in _context.EmpAssessments
                            join reviewer in _context.Employees on a.SubmittedBy equals reviewer.EmpID into reviewerJoin
                            from reviewer in reviewerJoin.DefaultIfEmpty()
                            where a.EmpID == e.EmpID
                            orderby a.SubmittedAt descending
                            select new
                            {
                                AppraisalDate = a.SubmittedAt.HasValue ? a.SubmittedAt.Value.ToString("dd/MM/yyyy") : "",
                                a.SelfDevelopment,
                                a.EmployeeStaffDevelopment,
                                a.DecisionMaking,
                                a.ProductivityEfficiency,
                                a.CallForDuty,
                                a.PerformanceScore,
                                a.AttendancePunctuality,
                                a.BehaviourOverallDiscipline,
                                a.DisciplineScore,
                                a.Integrity,
                                a.LoyaltySubmissionToCompanyGoals,
                                a.IntegrityScore,
                                FinalScore = a.FinalPercentage,
                                Rating = a.Rating ?? "",
                                Comments = a.FinalRemark ?? "",
                                ReviewedBy = reviewer != null ? reviewer.FirstName + " " + reviewer.LastName : "N/A",
                                a.Month,
                                a.Year,
                                a.IsLocked
                            }
                        ).FirstOrDefault(),
                        Qualification = _context.EmpAcadDetails
                            .Where(ed => ed.EmpID == e.EmpID)
                            .OrderByDescending(ed => ed.YearOfPassing)
                            .Select(ed => new
                            {
                                Qualification = ed.Qualification,
                                ed.Degree,
                                Institute = ed.Institution,
                                ed.Institution,
                                YearOfPassing = ed.YearOfPassing,
                                Grade = ed.Grade,
                                Percentage = ed.Grade
                            })
                            .FirstOrDefault(),
                        Leaves = _context.Leaves
                            .Where(l => l.EmpID == e.EmpID)
                            .OrderByDescending(l => l.StartDate)
                            .Select(l => new
                            {
                                l.LeaveID,
                                l.LeaveType,
                                l.LeaveReason,
                                l.StartDate,
                                l.EndDate,
                                l.CreatedAt,
                                l.IsApproved,
                                ApprovedBy = l.ApprovedbyEmpID,
                                l.RejectionReason,
                                l.OnDutyHours
                            })
                            .ToList(),
                        LeaveBalances = _context.LeaveBalances
                            .Where(lb => lb.EmpID == e.EmpID)
                            .OrderByDescending(lb => lb.Year)
                            .Select(lb => new
                            {
                                lb.Year,
                                lb.OpeningBalance,
                                lb.Availed,
                                lb.Adjusted,
                                lb.ClosingBalance
                            })
                            .ToList(),
                        LoansAndAdvances = _context.LnAs
                            .Where(la => la.EmpID == e.EmpID)
                            .OrderByDescending(la => la.StartDate)
                            .Select(la => new
                            {
                                la.LnAID,
                                la.LoanAmount,
                                la.Period,
                                la.InterestRate,
                                la.MonthlyInstallment,
                                la.StartDate,
                                la.IsApproved,
                                ApprovedBy = la.IsApprovedBy,
                                la.Description,
                                la.IsArrearOrAdvance,
                                la.isForceClosed,
                                la.isPaused,
                                la.UpdatedAt,
                                la.UpdatedBy
                            })
                            .ToList(),
                        BankDetails = _context.EmpBankDetails
                            .Where(bd => bd.EmpID == e.EmpID)
                            .Select(bd => new
                            {
                                bd.BankName,
                                bd.AccountNumber,
                                bd.IFSCCode,
                                bd.BranchName,
                                bd.UAN
                            })
                            .FirstOrDefault(),
                        ProfessionalDetails = _context.EmpProfDetails
                            .Where(pd => pd.EmpID == e.EmpID)
                            .Select(pd => new
                            {
                                pd.PreviousCompany,
                                pd.PreviousPosition,
                                pd.PreviousExperience,
                                PreviousExperienceCertificate = pd.PreviousExperienceCeritificate
                            })
                            .FirstOrDefault(),
                        Attendance = _context.Attendances
                            .Where(a => a.AtdEmpCode == e.AtdEmpCode)
                            .OrderByDescending(a => a.Date)
                            .Select(a => new
                            {
                                a.Date,
                                a.CheckInTime,
                                a.CheckOutTime,
                                a.TotalHours,
                                a.OnDutyHours
                            })
                            .FirstOrDefault(),
                        CTC = _context.EmpCTCandPayrolls
                            .Where(c => c.EmpID == e.EmpID)
                            .OrderByDescending(c => c.EffectiveDate)
                            .Select(c => new
                            {
                                c.CtcAmount,
                                c.MonthlyBasicPay,
                                c.BasicSalary,
                                c.Hra,
                                c.Da,
                                c.Lta,
                                c.SpecialAllowance,
                                c.PerformanceBonus,
                                c.GrossSalary,
                                c.NetAnnualSalary,
                                c.NetMonthlyPayable,
                                c.EPFEmployee,
                                c.RD,
                                c.HealthInsurance,
                                c.EffectiveDate
                            })
                            .FirstOrDefault(),
                        Increments = _context.EmpIncrements
                            .Where(i => i.EmpID == e.EmpID)
                            .OrderByDescending(i => i.WEFDate)
                            .Select(i => new
                            {
                                i.PreviousCTC,
                                i.IncrementPercentage,
                                i.IncrementAmount,
                                i.NewCTC,
                                WEFDate = i.WEFDate.ToString("dd/MM/yyyy"),
                                i.ApprovalStatus,
                                i.IsProcessed,
                                i.ArrearsAmount,
                                ArrearsPaid = i.ArrearsPaid ? "Yes" : "No",
                                ProcessedDate = i.ProcessedDate.HasValue ? i.ProcessedDate.Value.ToString("dd/MM/yyyy") : "",
                                CreatedAt = i.CreatedAt.ToString("dd/MM/yyyy")
                            })
                            .FirstOrDefault(),
                        e.ReportsTo,

                    };

                // Step 2??: Execute query
                var result = await employeesQuery.ToListAsync();

                // Step 3??: Add ReportsTo (manager names)
                var processedResult = result.Select(x =>
                {
                    var reportIds = x.ReportsTo ?? new List<int>();
                    var reportingManagers = reportIds
                        .Where(id => employeeDictionary.ContainsKey(id))
                        .Select(id => employeeDictionary[id])
                        .ToList();

                    var employeeWithManagers = new
                    {
                        x.Employee.EmpID,
                        x.Employee.EmployeeName,
                        x.Employee.EmployeeCode,
                        x.Employee.FirstName,
                        x.Employee.LastName,
                        x.Employee.DateOfJoining,
                        x.Employee.DateOfBirth,
                        x.Employee.Gender,
                        x.Employee.Address,
                        x.Employee.WorkEmail,
                        x.Employee.PersonalEmail,
                        x.Employee.PhoneNumber,
                        x.Employee.EmergencyContact,
                        x.Employee.EmergencyContactNumber,
                        x.Employee.Department,
                        x.Employee.Designation,
                        x.Employee.Location,
                        x.Employee.Role,
                        x.Employee.OBStatus,
                        x.Employee.EmploymentType,
                        x.Employee.Status,
                        x.Employee.DateofLeaving,
                        x.Employee.DateofRehire,
                        x.Employee.TerminateReasonOrLeavingReason,
                        ReportsTo = reportingManagers
                    };

                    return new
                    {
                        EmpID = employeeWithManagers.EmpID,
                        Employee = employeeWithManagers,
                        x.Payroll,
                        x.Appraisal,
                        x.Qualification,
                        x.Leaves,
                        x.LeaveBalances,
                        x.LoansAndAdvances,
                        x.BankDetails,
                        x.ProfessionalDetails,
                        x.Attendance,
                        x.CTC,
                        x.Increments
                    };
                }).ToList();

                // Step 4??: Filter by DateOfJoining (if provided)
                if (request.StartDate.HasValue && request.EndDate.HasValue)
                {
                    processedResult = processedResult
                        .Where(x =>
                        {
                            if (DateTime.TryParse(x.Employee.DateOfJoining?.ToString(), out var doj))
                            {
                                return doj.Date >= request.StartDate.Value.Date &&
                                       doj.Date <= request.EndDate.Value.Date;
                            }
                            return false;
                        })
                        .ToList();
                }

                // Step 5??: Select requested fields dynamically
                var data = processedResult.Select(x => BuildDynamicObject(x, request.Fields)).ToList();

                // Step 6??: Return Excel or JSON
                if (request.Format?.ToLower() == "excel")
                {
                    var headers = request.Fields;
                    return ExportToExcel(data, headers);
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error generating custom report",
                    details = ex.Message
                });
            }
        }

        private static IDictionary<string, object> BuildDynamicObject(dynamic x, List<string> fields)
        {
            var expando = new ExpandoObject() as IDictionary<string, object>;

            // Always include EmpID
            expando["EmpID"] = x.EmpID;
            expando["empID"] = x.EmpID;

            foreach (var field in fields)
            {
                var parts = field.Split('.');
                if (parts.Length != 2) continue;

                string section = parts[0];
                string propName = parts[1];

                object source = section switch
                {
                    "Employee" => x.Employee,
                    "Payroll" => x.Payroll,
                    "Qualification" => x.Qualification,
                    "Appraisal" => x.Appraisal,
                    "Leave" => x.Leaves?.FirstOrDefault(),
                    "LeaveBalance" => x.LeaveBalances?.FirstOrDefault(),
                    "LoanAndAdvance" => x.LoansAndAdvances?.FirstOrDefault(),
                    "Attendance" => x.Attendance,
                    "BankDetails" => x.BankDetails,
                    "ProfessionalDetails" => x.ProfessionalDetails,
                    "CTC" => x.CTC,
                    "Increments" => x.Increments,
                    _ => null
                };

                if (source == null) continue;

                // ? Special handling for ReportingManagers
                if (propName == "ReportingManagers")
                {
                    var prop = source.GetType().GetProperty("ReportsTo");
                    var reportsTo = prop?.GetValue(source) as List<string>;

                    expando[field] = reportsTo != null && reportsTo.Any()
                        ? string.Join(", ", reportsTo)
                        : null;

                    continue;
                }

                var property = source.GetType().GetProperty(propName);
                if (property == null) continue;

                var value = property.GetValue(source);

                // ? KEY FIX: DO NOT convert to string
                expando[field] = value;
            }

            return expando;
        }

        private FileContentResult ExportToExcel(List<IDictionary<string, object>> data, List<string> headers)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Report");
            int currentRow = 1;

            // Helper function to convert "Section.FieldName" to "Field Name"
            var cleanHeaderName = new Func<string, string>(header =>
            {
                var parts = header.Split('.');
                if (parts.Length == 2)
                {
                    // Convert camelCase to Title Case with spaces
                    var fieldName = parts[1];
                    var result = System.Text.RegularExpressions.Regex.Replace(fieldName, @"([A-Z])", " $1").Trim();
                    return result;
                }
                return header;
            });

            // Headers
            for (int i = 0; i < headers.Count; i++)
            {
                var cleanHeader = cleanHeaderName(headers[i]);
                worksheet.Cell(currentRow, i + 1).Value = cleanHeader;
                worksheet.Cell(currentRow, i + 1).Style.Font.Bold = true;
                worksheet.Cell(currentRow, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            // Data
            foreach (var row in data)
            {
                currentRow++;
                for (int i = 0; i < headers.Count; i++)
                {
                    var val = row.ContainsKey(headers[i]) ? row[headers[i]]?.ToString() ?? " " : " ";
                    worksheet.Cell(currentRow, i + 1).Value = val;
                }
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"CustomReport_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
            );
        }

        public class ReportRequest
        {
            public List<string> Fields { get; set; }
            public string Status { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string Format { get; set; } = "JSON";
        }

        public class FieldDefinition
        {
            public string Key { get; set; }
            public string Label { get; set; }
        }
    }
}
