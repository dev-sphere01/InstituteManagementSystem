# Leave Reports Feature Guide

## Overview

The Leave Reports feature provides a comprehensive dynamic reporting system for leave management. Users can select specific fields, apply filters, and export data in multiple formats (Excel, CSV, JSON).

## Features

### 1. Dynamic Field Selection

Select from multiple field categories:

- **Employee**: Employee ID, Name, Code, Department, Designation, Email
- **Leave**: Leave ID, Type, Reason, Dates, Status, Approver, Rejection Reason, On-Duty Hours
- **Leave Balance**: Year, Opening Balance, Availed, Adjusted, Closing Balance
- **Leave Transaction**: Transaction ID, Leave Date, Transaction Type, Days, Created Date

### 2. Advanced Filtering

Filter reports by:

- **Status**: Pending, Approved, Rejected
- **Leave Type**: Casual Leave, Sick Leave, Annual Leave, On Duty, Other
- **Date Range**: Start and End dates
- **Department**: Filter by specific department
- **Employee ID**: Filter by specific employee
- **Combinations**: Apply multiple filters simultaneously

### 3. Export Options

Export generated reports in three formats:

- **Excel (.xlsx)**: For data analysis and spreadsheet processing
- **CSV (.csv)**: For universal compatibility
- **JSON**: For programmatic access and integration

### 4. Data Display

- Paginated table view with configurable page sizes (10, 25, 50, 100 records)
- Column sorting (click headers to sort ascending/descending)
- Full-text search across all visible fields
- Responsive table with preview of selected columns
- Sidebar toggle for better screen real estate

## Usage Steps

### 1. Accessing Leave Reports

Navigate to **Leave Management → Reports**

### 2. Selecting Fields

1. Click **"Select Fields"** section in the sidebar
2. Choose individual fields by checking the checkbox next to each field
3. Or select all fields in a category by checking the category checkbox
4. Displays count of selected fields (e.g., "5/11 selected")

### 3. Applying Filters

1. Expand **"Filters"** section
2. Set desired filter values:
   - Select Status (or leave blank for all)
   - Choose Leave Type (or leave blank for all)
   - Enter Department name
   - Enter Employee ID
   - Select date range if needed
3. Filters are applied when report is generated

### 4. Generating Report

1. Click **"Generate Report"** button
2. System displays success message with record count
3. Results appear in the main content area
4. Loading indicator appears while processing

### 5. Viewing Results

- Table shows first 10 fields (others indicated as "+N more")
- Search bar allows full-text filtering
- Click column headers to sort
- Navigate pages using pagination controls
- Adjust records per page with dropdown

### 6. Exporting Data

After generating report:

1. Click **"Export to Excel"** for .xlsx format
2. Click **"Export to CSV"** for .csv format
3. Click **"Download JSON"** for JSON format
4. File downloads automatically with timestamp in name

### 7. Resetting Report

Click **"Reset"** button to:

- Clear all selected fields
- Remove all filters
- Clear generated report
- Reset pagination and sorting
- Clear search text

## API Endpoints

### Get Available Fields

```
GET /api/Leaves/AvailableReportFields
```

Returns categorized list of available fields for report generation.

**Response:**

```json
{
  "Employee": [
    { "Key": "EmpID", "Label": "Employee ID" },
    { "Key": "EmployeeName", "Label": "Employee Name" },
    ...
  ],
  "Leave": [...],
  "LeaveBalance": [...],
  "LeaveTransaction": [...]
}
```

### Generate Report

```
POST /api/Leaves/GenerateReport
```

Generates leave report based on selected fields and filters.

**Request Body:**

```json
{
  "Fields": ["Leave.LeaveType", "Employee.EmployeeName", "Leave.StartDate"],
  "Status": "Approved",
  "LeaveType": "Casual Leave",
  "StartDate": "2024-01-01",
  "EndDate": "2024-12-31",
  "Department": "IT",
  "EmpId": 123,
  "Format": "JSON"
}
```

**Response:**

```json
[
  {
    "Leave.LeaveType": "Casual Leave",
    "Employee.EmployeeName": "John Doe",
    "Leave.StartDate": "2024-01-15"
  },
  ...
]
```

## Technical Architecture

### Frontend Components

- **Reports.jsx**: Main component handling UI and user interactions
- **leaveReportService.js**: Service layer for API communication

### Backend Components

- **LeavesController**: HTTP endpoints for report generation
- **LeaveReportService**: Business logic for report generation
- **LeaveReportRequest**: DTO for request validation

### Data Processing

1. Query construction with filters
2. Data retrieval from database
3. Dynamic object creation with selected fields
4. Date formatting for consistency
5. Response to frontend

## Field Descriptions

### Leave Fields

- **LeaveID**: Unique identifier for leave request
- **LeaveType**: Category of leave (Casual, Sick, etc.)
- **LeaveReason**: Reason provided for leave
- **StartDate**: First day of leave
- **EndDate**: Last day of leave
- **LeaveDays**: Calculated total days (calculated on display)
- **CreatedAt**: Date leave was applied
- **IsApproved**: Current approval status
- **ApproverName**: Manager who approved/rejected
- **RejectionReason**: Reason for rejection if applicable
- **OnDutyHours**: Hours for On-Duty leaves

### Leave Balance Fields

- **Year**: Fiscal/calendar year
- **OpeningBalance**: Starting leave balance
- **Availed**: Leaves used in the year
- **Adjusted**: Administrative adjustments
- **ClosingBalance**: Remaining leaves

### Leave Transaction Fields

- **LeaveTransactionID**: Unique transaction identifier
- **LeaveDate**: Date of transaction
- **TransactionType**: Debit (availed) or Credit (adjustment)
- **Days**: Number of days in transaction
- **CreatedAt**: Transaction creation date

## Performance Considerations

- Pagination prevents loading large datasets
- Indexed queries for efficient filtering
- Date range filters reduce result sets
- Search performed client-side on displayed data
- Lazy loading of transaction details

## Troubleshooting

### No data appears

- Check filters are not too restrictive
- Verify selected fields include identifiable data
- Ensure date range covers leave periods
- Check employee status and department

### Export fails

- Verify sufficient disk space
- Check browser popup/download permissions
- Try alternative export format
- Clear browser cache

### Slow report generation

- Reduce date range if possible
- Apply more specific filters
- Limit number of records returned
- Check database performance

## Future Enhancements

- Scheduled report generation
- Email delivery of reports
- Custom report templates
- Chart visualizations
- Approval workflow reporting
- Leave balance projections
- Comparative analysis reports

## Related Documentation

- [Leave Management Guide](../LeaveManagement/README.md)
- [Employee Management](../../EmployeeManagement/README.md)
- [Reports Feature](../../Payroll/Reports.jsx)
