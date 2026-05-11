# Leave Reports Implementation Summary

## Overview

A comprehensive Leave Management Reports module has been implemented similar to the existing Payroll Reports. This module allows HR managers and employees to generate dynamic reports with field selection, filtering, sorting, pagination, and multi-format export capabilities.

## Implementation Details

### Created Files

#### 1. Frontend Service
**File**: `ui/src/services/LeaveManagement/leaveReportService.js`

Features:
- API endpoint management for Leave Reports
- Field normalization utilities
- Default field definitions
- File download handling
- Error handling with graceful fallbacks

Key Methods:
- `generateReport(reportRequest)` - Generate reports with selected fields and filters
- `getAvailableFields()` - Fetch available fields from backend
- `downloadFile(blob, fileName)` - Handle file downloads
- `getFieldLabel(fieldKey, availableFields)` - Convert field keys to labels

#### 2. Frontend Component
**File**: `ui/src/pages/EmployeePages/LeaveManagement/Reports.jsx`

Features:
- Dynamic field selection with category grouping
- Multi-criteria filtering (Status, Leave Type, Date Range, Department, Employee ID)
- Report generation with data validation
- Export to Excel, CSV, and JSON formats
- Advanced table with sorting, searching, and pagination
- Responsive sidebar UI with collapsible sections
- Loading states and error handling
- Comprehensive documentation

Key Functions:
- Field toggle and category selection
- Filter management
- Report generation with validation
- Data formatting and export
- Pagination and sorting logic
- Search and filtering

UI Components:
- Sidebar for field and filter selection
- Expandable sections for organization
- Data table with sortable columns
- Pagination controls
- Export buttons for multiple formats
- Search and reset functionality

#### 3. Backend Service
**File**: `api/EMS/Services/LeaveReportService.cs`

Features:
- Leave report generation with dynamic queries
- Data filtering by multiple criteria
- Leave balance calculations
- Leave transaction aggregation
- Dynamic object creation with selected fields
- Date formatting

Key Methods:
- `GenerateLeaveReport()` - Main report generation logic with complex LINQ queries
- Field mapping for Leave, Employee, LeaveBalance, LeaveTransaction entities
- Filter application for status, leave type, dates, department, employee

#### 4. Backend Controller Endpoints
**File**: `api/EMS/Controllers/LeavesController.cs` (Modified)

Added Endpoints:

**GET `/api/Leaves/AvailableReportFields`**
- Returns categorized list of available fields
- Categories: Employee, Leave, LeaveBalance, LeaveTransaction
- Each field has Key and Label properties

**POST `/api/Leaves/GenerateReport`**
- Accepts LeaveReportRequest with:
  - Fields (selected for report)
  - Filters (Status, LeaveType, DateRange, Department, EmpId)
  - Format (JSON, Excel, CSV)
- Returns dynamic list of records matching criteria

Added DTO:
- `LeaveReportRequest` - Request model for report generation

#### 5. Documentation
**File**: `ui/src/pages/EmployeePages/LeaveManagement/LEAVE_REPORTS_GUIDE.md`

Comprehensive guide covering:
- Feature overview
- Usage steps
- API documentation
- Field descriptions
- Technical architecture
- Performance considerations
- Troubleshooting
- Future enhancements

## Technical Architecture

### Frontend Stack
- **Framework**: React 19.1.0
- **UI Components**: Lucide React icons, Tailwind CSS
- **Data Export**: XLSX library
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios (via API service)

### Backend Stack
- **.NET Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0.18
- **Database**: MySQL 8.0+
- **Language**: C#

### Data Flow

1. **Frontend**: User selects fields and applies filters
2. **Frontend**: Sends LeaveReportRequest to backend
3. **Backend**: LeavesController receives request
4. **Backend**: LeaveReportService processes request:
   - Builds LINQ query with filters
   - Joins Leave with Employee, LeaveBalance, LeaveTransaction
   - Creates dynamic objects with selected fields
   - Formats dates for consistency
5. **Backend**: Returns list of dynamic objects
6. **Frontend**: Displays in paginated table
7. **Frontend**: User can sort, search, and export

## Available Fields

### Employee Category (6 fields)
- Employee ID
- Employee Name
- Employee Code
- Department
- Designation
- Work Email

### Leave Category (11 fields)
- Leave ID
- Leave Type
- Leave Reason
- Start Date
- End Date
- Leave Days (calculated)
- Applied Date
- Status (Pending/Approved/Rejected)
- Approver Name
- Rejection Reason
- On Duty Hours

### Leave Balance Category (5 fields)
- Year
- Opening Balance
- Availed
- Adjusted
- Closing Balance

### Leave Transaction Category (5 fields)
- Transaction ID
- Leave Date
- Transaction Type
- Days
- Created Date

## Filter Options

### Status Filter
- All (no filter)
- Pending
- Approved
- Rejected

### Leave Type Filter
- All (no filter)
- Casual Leave
- Sick Leave
- Annual Leave
- On Duty
- Other

### Other Filters
- Date Range (Start Date and End Date)
- Department (text input)
- Employee ID (numeric input)

## Export Formats

### Excel (.xlsx)
- Professional spreadsheet format
- Multiple sheets supported
- Formatting preserved
- File name: `LeaveReport_YYYY-MM-DD.xlsx`

### CSV (.csv)
- Universal compatibility
- Standard comma-separated values
- Text editor compatible
- File name: `LeaveReport_YYYY-MM-DD.csv`

### JSON (.json)
- Programmatic access
- Easy API integration
- Preserves data types
- Pretty-printed for readability
- File name: `LeaveReport_YYYY-MM-DD.json`

## Key Features

### 1. Dynamic Field Selection
- Select individual fields from multiple categories
- Quick select/deselect all in category
- Visual indicator of selection count
- Maintains field order

### 2. Advanced Filtering
- Multiple independent filters
- Optional filters (apply only when specified)
- Combination of filters (AND logic)
- Date range support

### 3. Data Presentation
- Paginated table view (10, 25, 50, 100 per page)
- Sortable columns (click to toggle ascending/descending)
- Full-text search across all fields
- Preview of additional fields with "+N more" indicator
- Total record count display

### 4. Export Capabilities
- Clean field labels (not technical keys)
- Proper date formatting
- Consistent data types
- Multiple format options

### 5. User Experience
- Collapsible sidebar for space efficiency
- Responsive button feedback
- Loading indicators
- Success/error notifications
- Reset functionality
- Smooth page transitions

## Database Queries

### Main Query Flow

```csharp
var query = _context.Leaves
    .Where(/* filters */)
    .Join(_context.Employees, /* left join for employee */)
    .GroupJoin(_context.Employees, /* left join for approver */)
    .SelectMany(/* flatten results */)
```

### Joins
- **Leave to Employee**: For employee information
- **Leave to Employee (again)**: For approver information (left join)

### Filters Applied
- Status (IsApproved = true/false/null)
- Leave Type
- Start Date >= provided date
- End Date <= provided date
- Employee ID
- Department (through Employee)

## Performance Considerations

1. **Pagination**: Prevents loading entire dataset
2. **Indexed Queries**: Database uses indexes for common filters
3. **Date Range**: Limits query scope
4. **LINQ Optimization**: Entity Framework optimizes queries
5. **Left Join**: Ensures records without approvers are included

## Integration Points

### Frontend Integration
- Imports from `@/services/LeaveManagement/leaveReportService`
- Uses `@/services/NotificationService` for alerts
- Uses `@/services/TableService` if needed for utilities

### Backend Integration
- Part of LeavesController
- Uses EMSDbContext for database access
- Leverages existing Leave, Employee, LeaveBalance, LeaveTransaction models

## Security Considerations

1. **Input Validation**: LeaveReportRequest validates inputs
2. **Authorization**: Protected by API authentication
3. **SQL Injection**: LINQ prevents SQL injection
4. **Data Privacy**: Respects leave data sensitivity
5. **Audit Trail**: Report generation can be logged

## Error Handling

### Frontend
- Validates field selection (at least 1 required)
- Catches API errors with meaningful messages
- Displays loading states
- Shows empty state when no data

### Backend
- Try-catch blocks in endpoints
- Graceful exception messages
- HTTP status codes (500 for errors)
- Field validation in service

## Testing Checklist

- [ ] Field selection functionality
- [ ] Category select/deselect all
- [ ] Individual filter application
- [ ] Multiple filters combination
- [ ] Report generation with no filters
- [ ] Report generation with all filters
- [ ] Export to Excel
- [ ] Export to CSV
- [ ] Download JSON
- [ ] Table sorting
- [ ] Table searching
- [ ] Pagination navigation
- [ ] Page size changes
- [ ] Reset functionality
- [ ] Sidebar collapse/expand
- [ ] Mobile responsiveness

## Future Enhancements

1. **Scheduled Reports**: Generate and email automatically
2. **Custom Templates**: User-defined report layouts
3. **Charts**: Visual representations of data
4. **Comparisons**: Year-over-year leave trends
5. **Forecasting**: Predict leave balance depletion
6. **Audit Logs**: Track who generated which reports
7. **Saved Reports**: Store frequently used reports
8. **Approval Workflow**: Report approval for sensitive data

## Deployment Notes

1. **Backend**: Add using statement for EMS.Services
2. **Frontend**: Ensure leaveReportService.js is accessible
3. **Database**: Ensure Leave, Employee, LeaveBalance, LeaveTransaction tables exist
4. **API**: Endpoints should be accessible at `/api/Leaves/`

## Maintenance

- Keep field definitions in sync with Leave model changes
- Update filters when new leave types are added
- Monitor performance with large datasets
- Maintain backward compatibility with API

## Support

For issues or enhancements:
1. Check LEAVE_REPORTS_GUIDE.md for documentation
2. Verify API endpoints are responding correctly
3. Check browser console for errors
4. Verify database connectivity
5. Test with sample data

## Related Components

- Payroll Reports: `ui/src/pages/Payroll/Reports.jsx` (similar structure)
- Leave Management: `ui/src/pages/EmployeePages/LeaveManagement/`
- LeavesController: `api/EMS/Controllers/LeavesController.cs`
- Leave Model: `api/EMS/Models/Leave.cs`
