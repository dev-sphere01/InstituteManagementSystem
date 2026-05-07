# Dynamic Reports Feature Guide

## Overview

The Dynamic Reports module enables users to create customized reports by selecting specific fields from multiple entities (Employee, Payroll, Appraisal, Qualification), applying filters, and exporting in multiple formats (JSON, Excel, CSV).

## Features

### 1. **Field Selection**
- Multi-entity field selection from:
  - **Employee**: Name, Code, Email, Department, Designation, Status, Dates, etc.
  - **Payroll**: Salary components, Net/Gross salary, Month/Year
  - **Appraisal**: Appraisal dates, ratings, comments, reviewers
  - **Qualification**: Education details, institute, percentage, passing year

- **Select All/Deselect All** buttons for each category
- Real-time field count display

### 2. **Filtering Options**
- **Employee Status**: Filter by Active, Inactive, OnLeave, Suspended
- **Date Range**: Filter by date of joining (Start Date - End Date)
- All filters are optional

### 3. **Report Generation**
- **Preview Report**: Generate report and view results in table format
- **Pagination**: Load more records dynamically (100 per load)
- **Responsive Layout**: Works on desktop and tablet

### 4. **Export Formats**
- **Excel (.xlsx)**: Full spreadsheet with headers and formatting
- **CSV (.csv)**: Comma-separated values for data analysis
- **JSON (.json)**: Raw JSON data for programmatic use

### 5. **Smart Formatting**
- Automatic currency formatting for large numbers (INR format)
- Date formatting (DD/MM/YYYY)
- Boolean values displayed as "Yes/No"
- Null values displayed as "-"
- Truncation of long strings for display

## User Interface

### Sidebar (Left Panel)
- **Select Fields**: Collapsible section with checkboxes for each field
- **Filters**: Status, Start Date, End Date selectors
- **Action Buttons**: Preview, Export Excel, Export CSV, Download JSON, Reset

### Main Content (Right Panel)
- **Results Table**: Displays selected fields with data
- **Summary**: Record count and generation timestamp
- **Load More**: Pagination control

## Frontend Implementation

### File Structure
```
src/
├── pages/Payroll/
│   └── Reports.jsx                 # Main component
├── services/Payroll/
│   ├── reportService.js            # API service
│   └── index.js                    # Service exports
```

### Key Components

#### Reports.jsx
Main React component with:
- State management for fields, filters, and results
- UI sections: Field selector, Filters, Results table
- Export functionality for multiple formats
- Loading states and error handling

#### reportService.js
Service layer providing:
- `generateReport()`: Main report generation
- `getAvailableFields()`: Fetch available fields
- `downloadFile()`: Handle file downloads
- Default fallback fields (if backend endpoint unavailable)

## Backend API Requirements

### 1. GenerateDynamicReport Endpoint

**Endpoint**: `POST /Reports/GenerateDynamicReport`

**Request Body**:
```csharp
public class ReportRequest
{
    public List<string> Fields { get; set; } = new();
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Format { get; set; } = "JSON"; // JSON, Excel, CSV
}
```

**Response**:
- **Format: JSON** → List of dictionaries with selected fields
- **Format: Excel** → Binary stream (xlsx file)
- **Format: CSV** → Binary stream (csv file)

**Example Request**:
```json
{
  "fields": [
    "Employee.EmployeeName",
    "Employee.EmployeeCode",
    "Employee.Department",
    "Payroll.BasicSalary",
    "Payroll.NetSalary",
    "Appraisal.Rating"
  ],
  "status": "Active",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "format": "JSON"
}
```

**Example Response** (JSON):
```json
[
  {
    "Employee.EmployeeName": "John Doe",
    "Employee.EmployeeCode": "EMP001",
    "Employee.Department": "Engineering",
    "Payroll.BasicSalary": 50000,
    "Payroll.NetSalary": 42000,
    "Appraisal.Rating": 4.5
  }
]
```

### 2. AvailableFields Endpoint (Optional)

**Endpoint**: `GET /Reports/AvailableFields`

**Response**:
```json
{
  "Employee": [
    { "key": "EmployeeName", "label": "Employee Name" },
    { "key": "EmployeeCode", "label": "Employee Code" },
    { "key": "Email", "label": "Email" },
    { "key": "Department", "label": "Department" }
  ],
  "Payroll": [
    { "key": "BasicSalary", "label": "Basic Salary" },
    { "key": "NetSalary", "label": "Net Salary" }
  ],
  "Appraisal": [
    { "key": "Rating", "label": "Rating" }
  ],
  "Qualification": [
    { "key": "Qualification", "label": "Qualification" }
  ]
}
```

**Note**: If this endpoint is not implemented, the frontend will use default fields defined in `reportService.js`.

## Sample Backend Implementation

```csharp
[HttpPost("GenerateDynamicReport")]
public async Task<IActionResult> GenerateDynamicReport([FromBody] ReportRequest request)
{
    try
    {
        // Base query
        var query = from e in _context.Employees
                    select new { e };

        // Add joins based on requested fields
        if (request.Fields.Any(f => f.StartsWith("Appraisal.")))
        {
            query = from e in _context.Employees
                    join a in _context.EmpAssessments on e.EmpID equals a.EmpID into appraisalGroup
                    from a in appraisalGroup.DefaultIfEmpty()
                    select new { e, a };
        }

        if (request.Fields.Any(f => f.StartsWith("Payroll.")))
        {
            query = from e in _context.Employees
                    join p in _context.Payrolls on e.EmpID equals p.EmpID into payrollGroup
                    from p in payrollGroup.DefaultIfEmpty()
                    select new { e, p };
        }

        if (request.Fields.Any(f => f.StartsWith("Qualification.")))
        {
            query = from e in _context.Employees
                    join q in _context.Qualifications on e.EmpID equals q.EmpID into qualGroup
                    from q in qualGroup.DefaultIfEmpty()
                    select new { e, q };
        }

        // Apply filters
        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(x => x.e.Status == request.Status);

        if (request.StartDate != null && request.EndDate != null)
            query = query.Where(x => x.e.DateOfJoining >= request.StartDate && 
                                     x.e.DateOfJoining <= request.EndDate);

        var result = await query.ToListAsync();

        // Shape result dynamically
        var data = result.Select(r =>
        {
            var dict = new Dictionary<string, object>();
            foreach (var field in request.Fields)
            {
                var parts = field.Split('.');
                var entity = parts[0];
                var prop = parts[1];

                object? value = entity switch
                {
                    "Employee" => r.e?.GetType().GetProperty(prop)?.GetValue(r.e),
                    "Appraisal" => r.a?.GetType().GetProperty(prop)?.GetValue(r.a),
                    "Payroll" => r.p?.GetType().GetProperty(prop)?.GetValue(r.p),
                    "Qualification" => r.q?.GetType().GetProperty(prop)?.GetValue(r.q),
                    _ => null
                };

                dict[field] = value ?? "";
            }
            return dict;
        }).ToList();

        // Return based on format
        if (request.Format?.ToLower() == "excel")
        {
            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Report");

            // Header row
            for (int i = 0; i < request.Fields.Count; i++)
                worksheet.Cell(1, i + 1).Value = request.Fields[i];

            // Data rows
            int row = 2;
            foreach (var record in data)
            {
                for (int i = 0; i < request.Fields.Count; i++)
                    worksheet.Cell(row, i + 1).Value = record[request.Fields[i]];
                row++;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;
            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"DynamicReport_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }
        else if (request.Format?.ToLower() == "csv")
        {
            using var stream = new MemoryStream();
            using (var writer = new StreamWriter(stream, leaveOpen: true))
            using (var csv = new CsvHelper.CsvWriter(writer, System.Globalization.CultureInfo.InvariantCulture))
            {
                csv.WriteRecords(data);
            }
            stream.Position = 0;
            return File(stream.ToArray(), "text/csv", $"DynamicReport_{DateTime.Now:yyyyMMddHHmmss}.csv");
        }

        // Default JSON response
        return Ok(data);
    }
    catch (Exception ex)
    {
        return BadRequest($"Error generating report: {ex.Message}");
    }
}

[HttpGet("AvailableFields")]
public IActionResult GetAvailableFields()
{
    var fields = new Dictionary<string, List<object>>
    {
        ["Employee"] = new()
        {
            new { key = "EmployeeName", label = "Employee Name" },
            new { key = "EmployeeCode", label = "Employee Code" },
            new { key = "Email", label = "Email" },
            new { key = "Department", label = "Department" },
            new { key = "Status", label = "Status" },
            new { key = "DateOfJoining", label = "Date of Joining" }
        },
        ["Payroll"] = new()
        {
            new { key = "BasicSalary", label = "Basic Salary" },
            new { key = "NetSalary", label = "Net Salary" }
        }
    };
    return Ok(fields);
}
```

## How to Use

### Step 1: Select Fields
1. Expand "Select Fields" section
2. Choose fields from each category (Employee, Payroll, Appraisal, Qualification)
3. Use "Select All" buttons to quickly select all fields in a category

### Step 2: Apply Filters (Optional)
1. Expand "Filters" section
2. Select Employee Status if needed
3. Set Start Date and End Date for date range filtering

### Step 3: Generate/Export Report
1. Click "Preview Report" to see results in table
2. Or directly click "Export to Excel" or "Export to CSV" to download
3. Click "Download JSON" to get raw JSON data

### Step 4: View Results
- Results table shows selected fields
- Scroll horizontally for many columns
- Click "Load More" to view additional records
- Use browser's Find feature (Ctrl+F) to search within visible records

## Customization

### Adding New Fields
To add new fields:

1. **Update Backend**: Add fields to the `GetAvailableFields()` endpoint
2. **Update Frontend Fallback**: Edit `getDefaultAvailableFields()` in `reportService.js`

### Changing Default Export Format
Edit the `reportRequest.format` in `Reports.jsx` handlers to change default format.

### Modifying UI Styling
- Tailwind CSS classes used throughout
- Colors: Indigo/Blue theme
- Dark mode can be added by modifying color classes

### Adding More Export Formats
1. Add format button in UI
2. Add export handler function
3. Create format-specific logic in `reportService.js`

## Performance Considerations

1. **Large Datasets**: 
   - Frontend pagination loads 100 records per "Load More"
   - Backend should implement cursor-based pagination for large results

2. **Field Selection**:
   - Minimize joins by selecting only needed fields
   - Each additional entity join impacts performance

3. **Date Range**:
   - Using date filters significantly reduces data size
   - Recommended for large employee databases

4. **Export Formats**:
   - CSV exports are fastest
   - Excel exports take longer due to formatting
   - JSON responses are lightweight

## Error Handling

- **No Fields Selected**: Warning notification
- **API Failure**: Error notification with backend message
- **Network Error**: Connection error handling via API interceptor
- **Token Expiration**: Automatic logout (handled by API interceptor)

## Browser Compatibility

- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (macOS/iOS)
- Edge: ✅ Full support
- IE 11: ❌ Not supported

## Keyboard Shortcuts

- Field selection checkboxes support Tab navigation
- Date pickers support native browser controls
- Export buttons can be accessed via Tab key

## Accessibility

- ARIA labels on form controls
- Semantic HTML structure
- Color contrast meets WCAG AA standards
- Keyboard navigation fully supported

## Troubleshooting

### Report shows no data
- Verify filters are correct
- Check if there are employees matching the criteria
- Ensure date range is valid

### Export button disabled
- Select at least one field
- Check if report has been generated

### Slow report generation
- Reduce date range
- Select fewer fields/entities
- Check backend performance

### Export file is empty
- Generate preview first to verify data exists
- Check browser console for errors
- Verify API is returning valid data

## Future Enhancements

- [ ] Scheduled report generation
- [ ] Report templates/saved reports
- [ ] Email distribution
- [ ] PDF export format
- [ ] Chart/graph visualization
- [ ] Advanced filtering (AND/OR conditions)
- [ ] Field sorting/grouping options
- [ ] Conditional formatting for Excel exports
- [ ] Report comparison (period-over-period)
- [ ] Audit trail for generated reports