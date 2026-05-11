using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using EMS.Data;
using EMS.Models;
using Microsoft.EntityFrameworkCore;
using static EMS.Controllers.LeavesController;

namespace EMS.Services
{
    public class LeaveReportService
    {
        private readonly EMSDbContext _context;

        public LeaveReportService(EMSDbContext context)
        {
            _context = context;
        }

        public async Task<List<IDictionary<string, object>>> GenerateLeaveReport(List<string> fields, string status, string leaveType, DateTime? startDate, DateTime? endDate, string department, int? empId)
        {
            var query = _context.Leaves.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(l => l.IsApproved == true);
                else if (status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(l => l.IsApproved == false);
                else if (status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(l => l.IsApproved == null);
            }

            if (!string.IsNullOrEmpty(leaveType))
                query = query.Where(l => l.LeaveType == leaveType);

            if (startDate.HasValue)
                query = query.Where(l => l.StartDate >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(l => l.EndDate <= endDate.Value.Date);

            if (empId.HasValue)
                query = query.Where(l => l.EmpID == empId.Value);

            var leaves = await (from leave in query
                                join emp in _context.Employees on leave.EmpID equals emp.EmpID
                                join approver in _context.Employees on leave.ApprovedbyEmpID equals approver.EmpID into approverGroup
                                from approverData in approverGroup.DefaultIfEmpty()
                                join edp in _context.EmpDeptPositions on leave.EmpID equals edp.EmpID into edpGroup
                                from edpData in edpGroup.DefaultIfEmpty()
                                join dept in _context.Departments on (edpData != null ? edpData.DeptID : 0) equals dept.DeptID into deptGroup
                                from deptData in deptGroup.DefaultIfEmpty()
                                join pos in _context.Set<Position>() on (edpData != null ? edpData.PositionID : 0) equals pos.PositionID into posGroup
                                from posData in posGroup.DefaultIfEmpty()
                                select new
                                {
                                    leave.LeaveID,
                                    leave.EmpID,
                                    leave.LeaveType,
                                    leave.LeaveReason,
                                    leave.StartDate,
                                    leave.EndDate,
                                    leave.IsApproved,
                                    leave.ApprovedbyEmpID,
                                    leave.RejectionReason,
                                    leave.OnDutyHours,
                                    leave.CreatedAt,
                                    EmployeeName = $"{emp.FirstName} {emp.LastName}",
                                    EmployeeCode = emp.EmpID.ToString(),
                                    EmployeeDept = deptData != null ? deptData.DeptName : "",
                                    EmployeeDesignation = posData != null ? posData.PositionName : "",
                                    EmployeeEmail = emp.WorkEmail,
                                    ApproverName = approverData != null ? $"{approverData.FirstName} {approverData.LastName}" : null,
                                })
                .ToListAsync();

            var leaveDaysList = await _context.LeaveTransactions
                .GroupBy(lt => new { lt.EmpID, lt.LeaveDate.Year })
                .Select(g => new { g.Key.EmpID, g.Key.Year, Days = g.Sum(x => x.Days) })
                .ToListAsync();

            var leaveBalances = await _context.LeaveBalances.ToListAsync();

            var result = leaves.Select(leave =>
            {
                var dynamicObj = new ExpandoObject() as IDictionary<string, object>;

                var year = leave.StartDate?.Year ?? DateTime.Now.Year;
                var balance = leaveBalances.FirstOrDefault(lb => lb.EmpID == leave.EmpID && lb.Year == year);
                var leaveDays = leaveDaysList.FirstOrDefault(ld => ld.EmpID == leave.EmpID && ld.Year == year);

                foreach (var field in fields)
                {
                    if (field.StartsWith("Leave."))
                    {
                        var fieldName = field.Substring("Leave.".Length);
                        switch (fieldName)
                        {
                            case "LeaveID":
                                dynamicObj[field] = leave.LeaveID;
                                break;
                            case "LeaveType":
                                dynamicObj[field] = leave.LeaveType;
                                break;
                            case "LeaveReason":
                                dynamicObj[field] = leave.LeaveReason;
                                break;
                            case "StartDate":
                                dynamicObj[field] = leave.StartDate?.ToString("yyyy-MM-dd");
                                break;
                            case "EndDate":
                                dynamicObj[field] = leave.EndDate?.ToString("yyyy-MM-dd");
                                break;
                            case "LeaveDays":
                                var days = leave.StartDate.HasValue && leave.EndDate.HasValue
                                    ? (leave.EndDate.Value.Date - leave.StartDate.Value.Date).Days + 1
                                    : 0;
                                dynamicObj[field] = days;
                                break;
                            case "CreatedAt":
                                dynamicObj[field] = leave.CreatedAt?.ToString("yyyy-MM-dd");
                                break;
                            case "IsApproved":
                                dynamicObj[field] = leave.IsApproved.HasValue
                                    ? (leave.IsApproved.Value ? "Approved" : "Rejected")
                                    : "Pending";
                                break;
                            case "ApproverName":
                                dynamicObj[field] = leave.ApproverName;
                                break;
                            case "RejectionReason":
                                dynamicObj[field] = leave.RejectionReason;
                                break;
                            case "OnDutyHours":
                                dynamicObj[field] = leave.OnDutyHours;
                                break;
                        }
                    }
                    else if (field.StartsWith("Employee."))
                    {
                        var fieldName = field.Substring("Employee.".Length);
                        switch (fieldName)
                        {
                            case "EmpID":
                                dynamicObj[field] = leave.EmpID;
                                break;
                            case "EmployeeName":
                                dynamicObj[field] = leave.EmployeeName;
                                break;
                            case "EmployeeCode":
                                dynamicObj[field] = leave.EmployeeCode;
                                break;
                            case "Department":
                                dynamicObj[field] = leave.EmployeeDept;
                                break;
                            case "Designation":
                                dynamicObj[field] = leave.EmployeeDesignation;
                                break;
                            case "WorkEmail":
                                dynamicObj[field] = leave.EmployeeEmail;
                                break;
                        }
                    }
                    else if (field.StartsWith("LeaveBalance."))
                    {
                        var fieldName = field.Substring("LeaveBalance.".Length);
                        switch (fieldName)
                        {
                            case "Year":
                                dynamicObj[field] = year;
                                break;
                            case "OpeningBalance":
                                dynamicObj[field] = balance?.OpeningBalance ?? 0;
                                break;
                            case "Availed":
                                dynamicObj[field] = balance?.Availed ?? 0;
                                break;
                            case "Adjusted":
                                dynamicObj[field] = balance?.Adjusted ?? 0;
                                break;
                            case "ClosingBalance":
                                dynamicObj[field] = balance?.ClosingBalance ?? 0;
                                break;
                        }
                    }
                    else if (field.StartsWith("LeaveTransaction."))
                    {
                        var fieldName = field.Substring("LeaveTransaction.".Length);
                        switch (fieldName)
                        {
                            case "LeaveTransactionID":
                                dynamicObj[field] = leave.LeaveID;
                                break;
                            case "LeaveDate":
                                dynamicObj[field] = leave.StartDate?.ToString("yyyy-MM-dd");
                                break;
                            case "TransactionType":
                                dynamicObj[field] = "Debit";
                                break;
                            case "Days":
                                dynamicObj[field] = leaveDays?.Days ?? 0;
                                break;
                            case "CreatedAt":
                                dynamicObj[field] = leave.CreatedAt?.ToString("yyyy-MM-dd");
                                break;
                        }
                    }
                }

                return dynamicObj;
            }).ToList();

            return result;
        }

        public async Task<List<LeaveRegisterReportDto>> GenerateLeaveRegisterReport(string viewType)
        {
            var employees = await _context.Employees.ToListAsync();

            var leavesSummary = await (from l in _context.Leaves
                                       group l by l.EmpID into g
                                       select new
                                       {
                                           EmpID = g.Key,
                                           TotalLeavesTaken = g.Count(x => x.IsApproved == true),
                                           ApprovedLeaves = g.Count(x => x.IsApproved == true),
                                           UnapprovedLeaves = g.Count(x => x.IsApproved == null),
                                           RejectedLeaves = g.Count(x => x.IsApproved == false)
                                       }).ToListAsync();

            var balanceSummary = await (from lb in _context.LeaveBalances
                                        group lb by lb.EmpID into g
                                        select new
                                        {
                                            EmpID = g.Key,
                                            TotalClosingBalance = g.Sum(x => x.ClosingBalance)
                                        }).ToListAsync();

            var result = new List<LeaveRegisterReportDto>();

            foreach (var emp in employees)
            {
                var empLeaveData = leavesSummary.FirstOrDefault(l => l.EmpID == emp.EmpID);
                var empBalanceData = balanceSummary.FirstOrDefault(b => b.EmpID == emp.EmpID);

                result.Add(new LeaveRegisterReportDto
                {
                    EmpID = emp.EmpID,
                    EmpName = $"{emp.FirstName} {emp.LastName}",
                    LeavesTaken = empLeaveData?.TotalLeavesTaken ?? 0,
                    LeaveBalance = empBalanceData?.TotalClosingBalance ?? 0,
                    ApprovedLeaves = empLeaveData?.ApprovedLeaves ?? 0,
                    UnapprovedLeaves = empLeaveData?.UnapprovedLeaves ?? 0,
                    NumberOfLOPs = viewType?.ToLower() == "hr" ? 0 : null,
                    LeaveToBeEncashed = viewType?.ToLower() == "hr" ? 0 : null
                });
            }

            return result;
        }

    }
}
