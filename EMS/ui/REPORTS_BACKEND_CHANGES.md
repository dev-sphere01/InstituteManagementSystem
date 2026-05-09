# Backend Changes Required for Reports Module Fixes

## Overview
This document outlines all the changes required in the backend `ReportsController.cs` to fix the data format and field issues identified in the Reports module.

---

## Changes Required in `ReportsController.cs`

### 1. Add EmploymentType to Available Fields (Line 55)
**Issue**: Employee type field is not available in the available fields list.

**Current**:
```csharp
new FieldDefinition { Key = "EmploymentType", Label = "Employment Type" },
```

**Status**: ✅ Already exists - just needs to be populated from Employee model.

---

### 2. Add Manager Name to Available Fields
**Issue**: Manager/Reporting Manager field is missing from Employee section.

**Location**: In `AvailableFields` method, after the "Designation" field, add:
```csharp
new FieldDefinition { Key = "ManagerName", Label = "Manager / Reporting Manager" },
```

---

### 3. Update Appraisal Field Labels (Lines 97-98)
**Issue**: Final Rating label should be "Final Score", and FinalRemark should be "Comments"

**Current**:
```csharp
new FieldDefinition { Key = "FinalPercentage", Label = "Final Rating" },
new FieldDefinition { Key = "FinalRemark", Label = "Final Remark" },
```

**Change To**:
```csharp
new FieldDefinition { Key = "FinalScore", Label = "Final Score" },
new FieldDefinition { Key = "Comments", Label = "Comments" },
```

Also add a new field for the rating:
```csharp
new FieldDefinition { Key = "Rating", Label = "Final Rating" },
```

---

### 4. Update Employee Data Query (Lines 210-232)
**Issue**: Need to add EmploymentType and Manager Name, and format dates properly.

**Replace This Section**:
```csharp
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
    Status = e.IsActive ? "Active" : "Inactive"
},
```

**With This**:
```csharp
Employee = new
{
    e.EmpID,
    EmployeeName = e.FirstName + " " + e.LastName,
    EmployeeCode = e.AtdEmpCode,
    e.FirstName,
    e.LastName,
    DateOfJoining = e.DateOfJoining.HasValue ? e.DateOfJoining.Value.Date.ToString("dd/MM/yyyy") : "",
    DateOfBirth = e.DateOfBirth.HasValue ? e.DateOfBirth.Value.Date.ToString("dd/MM/yyyy") : "",
    e.Gender,
    e.Address,
    e.WorkEmail,
    e.PersonalEmail,
    e.PhoneNumber,
    e.EmergencyContact,
    e.EmergencyContactNumber,
    Department = d.DeptName,
    Designation = p.PositionName,
    EmploymentType = e.EmploymentType ?? "Not Specified",
    Location = loc.LocationName ?? "",
    Role = r.RoleName ?? "",
    e.OBStatus,
    Status = e.IsActive ? "Active" : "Inactive"
},
```

---

### 5. Update Appraisal Data Query (Lines 259-287)
**Issue**: Need to:
- Change FinalPercentage key to FinalScore
- Change FinalRemark key to Comments
- Ensure ReviewedBy returns full name (already correct)
- Format AppraisalDate to remove time component

**Replace This Section**:
```csharp
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
        a.Rating,
        ReviewedBy = reviewer != null ? reviewer.FirstName + " " + reviewer.LastName : "N/A",
        a.Month,
        a.Year,
        a.IsLocked
    }
).FirstOrDefault(),
```

**With This**:
```csharp
Appraisal = (
    from a in _context.EmpAssessments
    join reviewer in _context.Employees on a.SubmittedBy equals reviewer.EmpID into reviewerJoin
    from reviewer in reviewerJoin.DefaultIfEmpty()
    where a.EmpID == e.EmpID
    orderby a.SubmittedAt descending
    select new
    {
        AppraisalDate = a.SubmittedAt.HasValue ? a.SubmittedAt.Value.Date.ToString("dd/MM/yyyy") : "",
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
```

---

### 6. Add Manager Name to Employee Query (Line 202)
**Issue**: Manager name field is missing.

**Add a JOIN** for the manager (before the where clause):
```csharp
join manager in _context.Employees on e.ReportingManagerID equals manager.EmpID into managerJoin
from manager in managerJoin.DefaultIfEmpty()
```

**Full JOIN clause**:
```csharp
var employeesQuery =
    from e in _context.Employees
    join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
    join d in _context.Departments on edp.DeptID equals d.DeptID
    join p in _context.Positions on edp.PositionID equals p.PositionID
    join loc in _context.Locations on e.LocationID equals loc.LocationID into locJoin
    from loc in locJoin.DefaultIfEmpty()
    join r in _context.Roles on e.RoleID equals r.RoleID into roleJoin
    from r in roleJoin.DefaultIfEmpty()
    join manager in _context.Employees on e.ReportingManagerID equals manager.EmpID into managerJoin
    from manager in managerJoin.DefaultIfEmpty()
    where e.IsActive == true && e.EmpID != 1
```

**Then add ManagerName to the Employee object**:
```csharp
ManagerName = manager != null ? manager.FirstName + " " + manager.LastName : "Not Assigned",
```

---

### 7. Update ExportToExcel Method (Lines 488-518)
**Issue**: Excel headers should show clean field names instead of "Section.FieldName" format.

**Current ExportToExcel method**:
```csharp
private FileContentResult ExportToExcel(List<IDictionary<string, object>> data, List<string> headers)
{
    using var workbook = new XLWorkbook();
    var worksheet = workbook.Worksheets.Add("Report");
    int currentRow = 1;

    // Headers
    for (int i = 0; i < headers.Count; i++)
        worksheet.Cell(currentRow, i + 1).Value = headers[i];

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
```

**Update it to clean header names**:
```csharp
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

    // Headers - use clean names
    for (int i = 0; i < headers.Count; i++)
    {
        var cleanHeader = cleanHeaderName(headers[i]);
        worksheet.Cell(currentRow, i + 1).Value = cleanHeader;
        // Bold header
        worksheet.Cell(currentRow, i + 1).Style.Font.Bold = true;
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
```

---

### 8. Update BuildDynamicObject Method (Lines 449-485)
**Issue**: The method needs to handle the new field names and date formatting.

**Add case for Manager in the section switch**:
```csharp
private static IDictionary<string, object> BuildDynamicObject(dynamic x, List<string> fields)
{
    var expando = new ExpandoObject() as IDictionary<string, object>;

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
            "Leave" => (x.Leaves is IEnumerable<object> leaves && leaves.Any()) ? leaves.First() : null,
            "LeaveBalance" => (x.LeaveBalances is IEnumerable<object> lb && lb.Any()) ? lb.First() : null,
            "LoanAndAdvance" => (x.LoansAndAdvances is IEnumerable<object> la && la.Any()) ? la.First() : null,
            "Attendance" => null,
            "BankDetails" => x.BankDetails,
            "ProfessionalDetails" => x.ProfessionalDetails,
            _ => null
        };

        if (source == null) continue;
        var prop = source.GetType().GetProperty(propName);
        if (prop != null)
        {
            var value = prop.GetValue(source);
            expando[field] = value != null ? value.ToString() : "";
        }
    }

    return expando;
}
```

**Note**: The method is already correctly structured. Just ensure the field names match those in the Employee/Appraisal query sections.

---

## Summary of Changes

### In AvailableFields Method:
- ✅ EmploymentType already listed (line 55)
- ❌ Add ManagerName field under Employee
- ❌ Change FinalPercentage Label from "Final Rating" to "Final Score"
- ❌ Change FinalRemark Label to "Comments"
- ❌ Add Rating field

### In GetCustomReport Method:
- ❌ Add JOIN for Manager (ReportingManagerID)
- ❌ Add ManagerName to Employee object
- ❌ Add EmploymentType to Employee object
- ❌ Format DateOfJoining to "dd/MM/yyyy"
- ❌ Format DateOfBirth to "dd/MM/yyyy"
- ❌ Format AppraisalDate to "dd/MM/yyyy"
- ❌ Change FinalPercentage to FinalScore in Appraisal
- ❌ Change FinalRemark to Comments in Appraisal
- ❌ Ensure Rating field is included

### In ExportToExcel Method:
- ❌ Add logic to clean header names (convert "Section.FieldName" to "Field Name")
- ❌ Make headers bold

---

## Testing Checklist

After making these changes, verify:
- [ ] Employee Type field shows a value (not blank)
- [ ] Manager Name appears in available fields and can be selected
- [ ] Field headers display with spaces (e.g., "Employee Name" not "EmployeeName")
- [ ] Final Score shows the percentage value
- [ ] Final Rating shows "Outstanding", "Very Good", etc.
- [ ] Comments field shows the remark text
- [ ] Reviewer Name shows full name (e.g., "John Doe" not employee code)
- [ ] All dates show only date in dd/MM/yyyy format (no time)
- [ ] All employees have same date format
- [ ] Excel export headers show clean names (e.g., "Date Of Joining" not "Employee.DateOfJoining")
- [ ] No blank cells for Employee Type (should show "Not Specified" if empty)
- [ ] Manager name shows "Not Assigned" if no manager is set
