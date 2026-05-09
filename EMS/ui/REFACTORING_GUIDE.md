# ViewAllReviewsTab Refactoring Guide

## Overview
The `ViewAllReviewsTab` component has been refactored to include nested tabs for viewing Single Reviews and Multiple Reviews, while maintaining all original functionality.

## Changes Made

### 1. **New Component Structure**
The `ViewAllReviewsTab` now contains 3 nested tabs:
- **Single Reviews** - Shows employees with single reviews from the API endpoint
- **Multiple Reviews** - Shows employees with multiple reviews from the API endpoint  
- **View All Reviews** - Original functionality (preserved)

### 2. **New Features**

#### A. Nested Tab Navigation
```javascript
{
  id: 'single',    // Single Reviews
  id: 'multiple',  // Multiple Reviews
  id: 'all'        // View All Reviews (Original)
}
```

#### B. Download Report Functionality
Both Single and Multiple Reviews tabs now have a **Download Report** button that:
- Calls the respective API endpoint
- Downloads an Excel file
- Shows loading state during download
- Displays success/error notifications

**API Endpoints:**
- Single Reviews Report: `GET /EmpAssessments/GetReportForSingleAssessments?sessionID={sessionID}`
- Multiple Reviews Report: `GET /EmpAssessments/GetReportForMultipleAssessments?sessionID={sessionID}`

#### C. Employee Dropdown with Search
Each tab has independent employee selection with:
- Search functionality (by name, ID, or email)
- Filtered dropdown display
- Clear button to reset selection

**API Endpoints:**
- Single Reviews Employees: `GET /EmpAssessments/GetEmployeeswithSingleReviews/{sessionID}`
- Multiple Reviews Employees: `GET /EmpAssessments/GetEmployeeswithMultipleReviews/{sessionID}`

#### D. Reviews Table
Reusable component showing reviews with:
- Review date, month/year, reviewer name
- Performance, Discipline, Integrity scores
- Final percentage score
- View Details and Regularize (Edit) buttons

### 3. **State Management**

#### Single Reviews Tab States
```javascript
const [singleReviewsEmployees, setSingleReviewsEmployees] = useState([])
const [filteredSingleReviewsEmployees, setFilteredSingleReviewsEmployees] = useState([])
const [selectedSingleReviewEmpId, setSelectedSingleReviewEmpId] = useState(null)
const [selectedSingleReviewEmployee, setSelectedSingleReviewEmployee] = useState(null)
const [singleReviewEmployeeSearch, setSingleReviewEmployeeSearch] = useState('')
const [showSingleReviewEmployeeDropdown, setShowSingleReviewEmployeeDropdown] = useState(false)
const [singleReviewsData, setSingleReviewsData] = useState([])
const [loadingSingleReviews, setLoadingSingleReviews] = useState(false)
```

#### Multiple Reviews Tab States
```javascript
const [multipleReviewsEmployees, setMultipleReviewsEmployees] = useState([])
const [filteredMultipleReviewsEmployees, setFilteredMultipleReviewsEmployees] = useState([])
const [selectedMultipleReviewEmpId, setSelectedMultipleReviewEmpId] = useState(null)
const [selectedMultipleReviewEmployee, setSelectedMultipleReviewEmployee] = useState(null)
const [multipleReviewEmployeeSearch, setMultipleReviewEmployeeSearch] = useState('')
const [showMultipleReviewEmployeeDropdown, setShowMultipleReviewEmployeeDropdown] = useState(false)
const [multipleReviewsData, setMultipleReviewsData] = useState([])
const [loadingMultipleReviews, setLoadingMultipleReviews] = useState(false)
```

#### Download States
```javascript
const [downloadingSingleReport, setDownloadingSingleReport] = useState(false)
const [downloadingMultipleReport, setDownloadingMultipleReport] = useState(false)
```

### 4. **Key Functions**

#### Data Fetching Functions
- `fetchSingleReviewsEmployees()` - Fetches employees with single reviews
- `fetchMultipleReviewsEmployees()` - Fetches employees with multiple reviews
- `fetchSingleReviewsForEmployee(empId)` - Fetches reviews for an employee
- `fetchMultipleReviewsForEmployee(empId)` - Fetches reviews for an employee

#### Download Functions
- `downloadSingleReviewsReport()` - Downloads single reviews Excel report
- `downloadMultipleReviewsReport()` - Downloads multiple reviews Excel report

#### Selection Handlers
- `handleSingleReviewEmployeeSelect(emp)` - Handle employee selection in single reviews
- `handleMultipleReviewEmployeeSelect(emp)` - Handle employee selection in multiple reviews
- `handleSingleReviewEmployeeSearch(searchTerm)` - Filter single reviews employees
- `handleMultipleReviewEmployeeSearch(searchTerm)` - Filter multiple reviews employees

#### Reusable Components
- `ReviewsTable({ reviews, isLoading, selectedEmpId, ... })` - Renders review table
- `EmployeeSearchDropdown({ ... })` - Renders employee search dropdown

### 5. **Parent Component Updates**

**File:** `src/pages/EmployeeManagement/PerformanceManagement/components/HrSideForm/index.jsx`

**Change:** Added explicit `selectedSessionId` prop to ViewAllReviewsTab:
```javascript
<ViewAllReviewsTab
  {...viewAllReviews}
  selectedSessionId={selectedSessionId}  // <- Added
  // ... other props
/>
```

## API Integration Notes

### TODO Items
The following API endpoints are placeholders and need to be updated with actual backend URLs:

1. **Fetch reviews for selected employee:**
   ```javascript
   // Currently:
   GET /EmpAssessments/GetReviewsForEmployee/{empId}?type=single
   GET /EmpAssessments/GetReviewsForEmployee/{empId}?type=multiple
   
   // Update to your actual API endpoints
   ```

2. **File Download:**
   The download functionality uses `responseType: 'blob'` to handle file downloads:
   ```javascript
   const response = await API.get(`/endpoint`, {
     responseType: 'blob'
   })
   ```

## Usage Example

### Single Reviews Tab Flow:
1. User navigates to "Single Reviews" tab
2. Component fetches employees with single reviews
3. User selects an employee from dropdown
4. Component fetches and displays reviews for that employee
5. User can:
   - View details of any review
   - Regularize (edit) a review
   - Download the entire single reviews report

### Multiple Reviews Tab Flow:
Same as above but for employees with multiple reviews

### View All Reviews Tab Flow:
Original functionality preserved - displays all reviews for selected employee

## Error Handling

The component includes error handling for:
- Failed API calls with user notifications
- Missing session ID validation
- Network errors during file download
- Invalid data responses

**Notification Messages:**
- Success: "Report downloaded successfully"
- Error: "Failed to fetch employees with single reviews" / "Failed to download report"
- Info: "Session not selected"

## File Structure

```
HrSideForm/
├── index.jsx (parent component - UPDATED)
├── tabs/
│   ├── ViewAllReviewsTab.jsx (REFACTORED)
│   ├── AssessmentTab.jsx
│   ├── RandomAssessmentTab.jsx
│   └── ReviewAssignedTab.jsx
├── components/
│   ├── TabNavigation.jsx
│   ├── ReviewDetailModal.jsx
│   ├── RegularizationModal.jsx
│   ├── ImportModePanel.jsx
│   ├── FilterButtons.jsx
│   ├── EmployeeSearchDropdown.jsx
│   └── AssessmentGrid.jsx
├── hooks/
│   ├── useReviewParameters.js
│   ├── useAssessmentData.js
│   ├── useEmployeeSearch.js
│   ├── useRandomAssessment.js
│   ├── useAssignedReviews.js
│   └── useViewAllReviews.js
├── utils/
│   ├── constants.js
│   ├── calculationHelpers.js
│   └── apiHelpers.js
```

## Testing Checklist

- [ ] Single Reviews tab loads and displays employees
- [ ] Multiple Reviews tab loads and displays employees
- [ ] Employee search works in both tabs
- [ ] Selecting an employee fetches their reviews
- [ ] Reviews table displays all fields correctly
- [ ] View Details button works
- [ ] Regularize button works and shows edit form
- [ ] Download Report button downloads Excel files
- [ ] Error notifications appear for failed requests
- [ ] Original View All Reviews tab functionality preserved
- [ ] Regularization form works correctly
- [ ] Submit button submits regularization

## Browser Compatibility

The component uses:
- Modern JavaScript (ES6+)
- Blob API for file downloads
- Fetch API (via Axios)
- React Hooks

Supported browsers:
- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile browsers: Latest

## Performance Considerations

1. **Lazy Loading:** Employees only fetched when tab becomes active
2. **Search Optimization:** Client-side filtering for responsive search
3. **File Downloads:** Handled via blob to avoid memory issues
4. **State Management:** Separate state for each tab to prevent cross-tab pollution

## Next Steps

1. **Update API Endpoints:** Replace placeholder endpoints with actual backend routes
2. **Test Download Functionality:** Ensure Excel reports are generated correctly
3. **Test Employee Fetching:** Verify both single and multiple reviews endpoints work
4. **Validate Error Scenarios:** Test with network errors, empty data, etc.
5. **User Testing:** Get feedback on UI/UX for nested tabs

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoints are correct
3. Ensure sessionID is being passed correctly
4. Check network tab in browser DevTools for API calls