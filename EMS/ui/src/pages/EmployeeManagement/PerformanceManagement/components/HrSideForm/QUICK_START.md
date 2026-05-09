# Quick Start Guide - Continue Refactoring

## What Has Been Done

✅ **Foundation Complete (43% of total work)**
- All utility functions created
- Basic hooks created (3/6)
- Basic UI components created (3/7)
- Documentation and structure in place

## What Needs to Be Done

### Step 1: Complete Remaining Hooks (Priority: HIGH)

#### 1.1 Create `hooks/useRandomAssessment.js`
Extract lines ~56-70 and ~1003-1052 from original file.

**Key functionality:**
- Manage assessor selection state
- Manage assessees selection state (array)
- Handle assessor/assessee search
- Submit random assessment
- Reset form after submission

**Template:**
```javascript
import { useState } from 'react'
import { useEmployeeSearch } from './useEmployeeSearch'
import { submitRandomAssessment } from '../utils/apiHelpers'
import { notification } from '@/services'

export const useRandomAssessment = (allEmployees, selectedSessionId) => {
  const notify = notification()
  const [selectedAssessor, setSelectedAssessor] = useState(null)
  const [selectedAssessees, setSelectedAssessees] = useState([])
  
  // Use employee search hook for assessor
  const assessorSearch = useEmployeeSearch(allEmployees)
  
  // Use employee search hook for assessees
  const assesseeSearch = useEmployeeSearch(allEmployees)
  
  // ... implement handlers
  
  return {
    selectedAssessor,
    selectedAssessees,
    assessorSearch,
    assesseeSearch,
    handleAssessorSelect,
    handleAssesseeToggle,
    handleRemoveAssessee,
    handleSubmit,
    resetForm
  }
}
```

#### 1.2 Create `hooks/useAssignedReviews.js`
Extract lines ~72-80 and related logic from original file.

**Key functionality:**
- Fetch assigned employees
- Manage selected assigned employee
- Filter assigned employees
- Handle assessment submission for assigned employees

#### 1.3 Create `hooks/useViewAllReviews.js`
Extract lines ~82-111 and related logic from original file.

**Key functionality:**
- Fetch all employees for review viewing
- Load all reviews for selected employee
- Manage review detail modal state
- Manage regularization modal state
- Handle regularization submission

### Step 2: Create Remaining UI Components (Priority: HIGH)

#### 2.1 Create `components/AssessmentGrid.jsx`
Extract lines ~1218-1600 from original file (the large table).

**Key sections:**
- Table header with categories
- Sub-header with parameters
- Employee rows with input cells
- Score calculation cells
- Final remark textarea
- Submit button

**Props needed:**
```javascript
{
  employees,
  reviewParameters,
  categories,
  assessmentData,
  finalRemarks,
  onAssessmentChange,
  onFinalRemarkChange,
  calculateCategoryScore,
  calculateFinalPercentage,
  onSubmit,
  areReviewsLocked,
  isHindi,
  getCategoryWeightage,
  directReviewsFilter
}
```

#### 2.2 Create `components/ImportModePanel.jsx`
Extract lines ~1120-1216 from original file.

**Key sections:**
- ExcelImportService integration
- File upload area
- Data preview table
- Validation messages
- Submit button

#### 2.3 Create `components/ReviewDetailModal.jsx`
Extract lines ~2300-2625 from original file (approximate).

**Key sections:**
- Modal overlay and container
- Review information display
- Parameter breakdown by category
- Close button

#### 2.4 Create `components/RegularizationModal.jsx`
Extract regularization form logic from original file.

**Key sections:**
- Modal form
- Parameter inputs
- Final remark textarea
- Submit/Cancel buttons

### Step 3: Create Tab Components (Priority: MEDIUM)

#### 3.1 Create `tabs/AssessmentTab.jsx`
Combine:
- FilterButtons component
- Import/Export controls
- ImportModePanel component (conditional)
- AssessmentGrid component (conditional)

#### 3.2 Create `tabs/RandomAssessmentTab.jsx`
Use:
- useRandomAssessment hook
- EmployeeSearchDropdown (x2)
- Submit button

#### 3.3 Create `tabs/ReviewAssignedTab.jsx`
Combine:
- useAssignedReviews hook
- FilterButtons component
- EmployeeSearchDropdown
- AssessmentGrid component

#### 3.4 Create `tabs/ViewAllReviewsTab.jsx`
Combine:
- useViewAllReviews hook
- EmployeeSearchDropdown
- Reviews list
- ReviewDetailModal
- RegularizationModal

### Step 4: Create Main Index Component (Priority: MEDIUM)

#### 4.1 Create `index.jsx`
**Structure:**
```javascript
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useEmpDataStore from '@/store/empDataStore'

// Import hooks
import { useReviewParameters } from './hooks/useReviewParameters'
import { useAssessmentData } from './hooks/useAssessmentData'
// ... other hooks

// Import components
import TabNavigation from './components/TabNavigation'
// ... other components

// Import tabs
import AssessmentTab from './tabs/AssessmentTab'
import RandomAssessmentTab from './tabs/RandomAssessmentTab'
import ReviewAssignedTab from './tabs/ReviewAssignedTab'
import ViewAllReviewsTab from './tabs/ViewAllReviewsTab'

const HrSideForm = (props) => {
  // Extract props
  const {
    selectedSessionId,
    reviewSessions,
    loadingSessions,
    areReviewsLocked,
    setAreReviewsLocked,
    isHindi,
    setIsHindi,
    reviewStats,
    loadingStats,
    overallFilter
  } = props
  
  // Global state
  const [activeTab, setActiveTab] = useState('assessment')
  const { currentEmployee } = useEmpDataStore()
  
  // Initialize hooks
  const reviewParams = useReviewParameters()
  const assessmentData = useAssessmentData(reviewParams.reviewParameters)
  // ... other hooks
  
  // Determine which tabs to show
  const showRandomAssessmentTab = /* logic */
  const showReviewAssignedTab = /* logic */
  const showViewAllReviewsTab = /* logic */
  
  // Render
  return (
    <div>
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showRandomAssessmentTab={showRandomAssessmentTab}
        showReviewAssignedTab={showReviewAssignedTab}
        showViewAllReviewsTab={showViewAllReviewsTab}
      />
      
      {selectedSessionId ? (
        <>
          {activeTab === 'assessment' && <AssessmentTab {...assessmentTabProps} />}
          {activeTab === 'random' && showRandomAssessmentTab && <RandomAssessmentTab {...randomTabProps} />}
          {activeTab === 'reviewAssigned' && showReviewAssignedTab && <ReviewAssignedTab {...assignedTabProps} />}
          {activeTab === 'viewAllReviews' && showViewAllReviewsTab && <ViewAllReviewsTab {...viewAllTabProps} />}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default HrSideForm
```

### Step 5: Testing and Integration (Priority: LOW)

#### 5.1 Test Each Component Individually
- Import and test each hook
- Test each UI component
- Test each tab component

#### 5.2 Integration Testing
- Test complete flow
- Test tab switching
- Test data persistence
- Test API calls

#### 5.3 Update Parent Component
- Update import path from `./HrSideForm.jsx` to `./HrSideForm/index.jsx`
- Verify all props are passed correctly
- Test in production-like environment

## File Extraction Guide

### How to Extract Code from Original File

1. **Open original file**: `HrSideForm.jsx`
2. **Identify the section** you need (use line numbers from this guide)
3. **Copy the relevant code**
4. **Adapt to new structure**:
   - Remove unused state variables
   - Update imports
   - Convert to use hooks
   - Add prop validation
5. **Test the extracted component**

### Example: Extracting AssessmentGrid

**Original location**: Lines ~1218-1600

**Steps**:
1. Copy the table JSX
2. Create new file: `components/AssessmentGrid.jsx`
3. Add imports:
   ```javascript
   import React from 'react'
   import { motion } from 'framer-motion'
   ```
4. Define props:
   ```javascript
   const AssessmentGrid = ({
     employees,
     reviewParameters,
     // ... other props
   }) => {
     // Component logic
   }
   ```
5. Paste and adapt the JSX
6. Export the component

## Common Patterns

### Pattern 1: Converting State to Props
**Before (in original file):**
```javascript
const [employees, setEmployees] = useState([])
// ... used in JSX
```

**After (in new component):**
```javascript
const AssessmentGrid = ({ employees }) => {
  // ... use employees directly
}
```

### Pattern 2: Converting Functions to Callbacks
**Before:**
```javascript
const handleAssessmentChange = (empId, parameterId, value) => {
  // ... logic
}
```

**After:**
```javascript
const AssessmentGrid = ({ onAssessmentChange }) => {
  // ... call onAssessmentChange
}
```

### Pattern 3: Using Custom Hooks
**Before:**
```javascript
const [searchTerm, setSearchTerm] = useState('')
const [filteredEmployees, setFilteredEmployees] = useState([])
// ... filtering logic
```

**After:**
```javascript
const { searchTerm, filteredEmployees, setSearchTerm } = useEmployeeSearch(allEmployees)
```

## Troubleshooting

### Issue: Missing Dependencies
**Solution**: Check imports and ensure all utility functions are imported

### Issue: Props Not Passed Correctly
**Solution**: Use console.log to trace prop flow from parent to child

### Issue: State Not Updating
**Solution**: Ensure callbacks are properly connected and state is lifted to correct level

### Issue: Hooks Rules Violation
**Solution**: Ensure hooks are called at top level, not in conditions or loops

## Next Actions

1. ✅ Review this guide
2. ⏳ Create `hooks/useRandomAssessment.js`
3. ⏳ Create `hooks/useAssignedReviews.js`
4. ⏳ Create `hooks/useViewAllReviews.js`
5. ⏳ Create `components/AssessmentGrid.jsx`
6. ⏳ Create `components/ImportModePanel.jsx`
7. ⏳ Create `components/ReviewDetailModal.jsx`
8. ⏳ Create `components/RegularizationModal.jsx`
9. ⏳ Create all tab components
10. ⏳ Create `index.jsx`
11. ⏳ Test and integrate

## Estimated Time

- Remaining Hooks: 2-3 hours
- Remaining UI Components: 4-5 hours
- Tab Components: 3-4 hours
- Main Index: 2-3 hours
- Testing & Integration: 2-3 hours

**Total: 13-18 hours of development work**

## Questions?

Refer to:
- `README.md` - Overall structure and benefits
- `COMPONENT_HIERARCHY.md` - Visual component tree
- `REFACTORING_PROGRESS.md` - Current progress
- Original `HrSideForm.jsx` - Reference implementation