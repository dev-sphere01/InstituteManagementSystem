# Leave Calendar Implementation Guide

## Overview
The Leave Calendar component is a comprehensive calendar view for managing leave requests and viewing holidays, similar to Google Calendar.

## File Location
```
src/pages/EmployeePages/LeaveManagement/LeaveCalender.jsx
```

## Features

### 1. **Leave Request Display**
- Shows all leave requests from the database
- Color-coded by leave type
- Status indicators (Approved, Pending, Rejected)
- Multi-day leave spans visualized across calendar dates

### 2. **Holiday Display**
- Shows company holidays on the calendar
- Automatically highlights holiday dates
- Pink icon (🏠) to distinguish holidays from leave requests

### 3. **Color Coding System**
```
Sick Leave      → Red (#dc2626)
Personal Leave  → Amber (#f59e0b)
Paid Leave      → Blue (#3b82f6)
Annual Leave    → Purple (#8b5cf6)
On-Duty Leave   → Green (#10b981)
Missed Leave    → Gray (#6b7280)
Holidays        → Pink (#ec4899)
```

### 4. **Multiple View Options**
- **Month View** - Full calendar month with all events
- **Week View** - Focused week view
- **Day View** - Single day details
- **Agenda View** - List-based event view

### 5. **Interactive Features**
- **Click on Event** - View detailed information about a leave request or holiday
- **Click on Date Slot** - Select specific dates
- **Hover Effects** - Visual feedback on event hover
- **Status Transparency** - Pending requests shown with reduced opacity

### 6. **Event Details Panel**
When you click on a leave request, the sidebar displays:
- Leave Type (color-coded badge)
- Status (Approved/Pending/Rejected)
- Employee Name
- Date Range
- Leave Reason
- Approved By (if applicable)

For holidays:
- Holiday Name
- Full Date

### 7. **Summary Statistics**
Right sidebar shows:
- Total Leaves
- Approved Count
- Pending Count
- Rejected Count
- Total Holidays

### 8. **Legend**
Color legend displayed in the sidebar for quick reference

## Holidays Configuration

Holidays are currently hardcoded in the component (`HOLIDAYS_2024_2025`). To update holidays:

```javascript
const HOLIDAYS_2024_2025 = [
  { date: '2024-01-26', name: 'Republic Day' },
  { date: '2024-03-08', name: 'Maha Shivaratri' },
  // Add more holidays as needed
];
```

### Future Enhancement: API Integration
To fetch holidays from the API instead:
```javascript
// Create a new service file
src/services/Holidays/holidaysService.js

// Implement API call in useEffect
const fetchHolidays = async () => {
  const data = await HolidaysService.getHolidays();
  // Transform and set holidays
};
```

## Data Structure

### Leave Event Format
```javascript
{
  id: 'leave-123',
  title: 'Sick - Approved',
  start: Date,
  end: Date,
  resource: {
    type: 'leave',
    leaveId: 123,
    leaveType: 'Sick',
    reason: 'Medical appointment',
    status: 'Approved',
    employeeName: 'John Doe',
    approvedBy: 'Manager Name'
  }
}
```

### Holiday Event Format
```javascript
{
  id: 'holiday-1',
  title: '🏠 Independence Day',
  start: Date,
  end: Date,
  resource: {
    type: 'holiday',
    name: 'Independence Day'
  }
}
```

## State Management

### Component State
- `events` - Combined array of leave requests and holidays
- `holidays` - Holiday events only
- `loading` - Loading state during data fetch
- `selectedEvent` - Currently selected event for details display
- `viewType` - Current calendar view mode
- `selectedDate` - Last selected date
- `empId` - Current employee ID

## Styling

### CSS Classes Used
- Tailwind CSS for layout and responsive design
- `react-big-calendar` default styles with custom overrides
- Inline styles for dynamic colors based on event type

### Custom Styling Features
- Week grid height set to 600px (adjustable)
- Today's date highlighted in yellow
- Event cards have:
  - Rounded corners (8px)
  - Border styling matching background
  - Hover effect with elevation
  - Status-based opacity

## Integration Points

### API Integration
Uses `LeavesService.getLeaves(empId)` to fetch:
- Leave requests for the employee
- Leave type
- Start/end dates
- Approval status
- Employee name
- Approver name

### State Management
Uses `useAuthStore` to get:
- Current user information
- Employee ID
- Employee name

### Notifications
Uses `notification()` service for:
- Error messages
- Loading states

## Responsive Design

The component is fully responsive:
- **Desktop** - Calendar takes 3/4 width, sidebar takes 1/4
- **Tablet** - Adjusts grid layout
- **Mobile** - Single column layout with calendar full width

```javascript
lg:col-span-3  // Calendar on desktop
lg:col-span-1  // Sidebar on desktop
// On mobile, both take full width
```

## Installation Requirements

### New Dependency Added
- `moment` (^2.29.4) - Required for react-big-calendar date localization

Run after changes:
```bash
npm install
```

## Usage Example

```jsx
import LeaveCalender from '@/pages/EmployeePages/LeaveManagement/LeaveCalender';

// In your page/route:
<LeaveCalender />
```

## Customization Guide

### Change Colors
Edit the `LEAVE_TYPE_COLORS` object:
```javascript
const LEAVE_TYPE_COLORS = {
  'Sick': '#your-color',
  // ...
};
```

### Add New Leave Type
1. Add color to `LEAVE_TYPE_COLORS`
2. Add option to `leaveTypes` in LeaveManagement form
3. Update legend if needed (automatic)

### Modify Calendar Height
```javascript
style={{ height: 600 }} // Change this value in Calendar component
```

### Change Holiday Display Icon
```javascript
title: `🏠 ${holiday.name}` // Change emoji or remove it
```

## Future Enhancements

1. **Holiday API Integration** - Fetch holidays from backend
2. **Department-wise View** - Show leaves for specific departments (admin)
3. **Team Calendar** - View team member leaves together
4. **Leave Balance Display** - Show remaining leave balance for each type
5. **Print/Export** - Export calendar as PDF or image
6. **Notifications** - Push notifications for leave approvals
7. **Conflict Detection** - Show conflicts when multiple people request leave
8. **Timesheet View** - Integrate with attendance/timesheet
9. **Leave Statistics** - Charts and analytics on leave trends
10. **Mobile App** - Native calendar UI for mobile

## Troubleshooting

### Calendar Not Showing Events
- Check if `LeavesService.getLeaves()` returns valid data
- Verify date formats are in ISO 8601 format
- Check browser console for errors

### Styling Issues
- Clear browser cache
- Ensure `react-big-calendar` CSS is imported
- Check if custom CSS rules are conflicting with Tailwind

### Performance Issues
- If many events (>1000), consider pagination
- Implement event filtering by date range
- Use `useMemo` for event transformation (already implemented)

## API Endpoints Used

- `GET /Leaves/GetLeavesbyEmpID/{empId}` - Fetch employee leaves
- Future: `GET /Holidays` - Fetch holidays (to be implemented)

## Database Schema Expected

The leave data structure should include:
```javascript
{
  LeaveID: number,
  EmpID: number,
  LeaveType: string,
  StartDate: ISO8601 Date,
  EndDate: ISO8601 Date,
  LeaveReason: string,
  IsApproved: boolean | null,
  CreatedAt: ISO8601 Date,
  EmployeeName: string,
  ApproverName: string | null
}
```

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready