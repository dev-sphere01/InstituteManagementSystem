# HrSideForm Component Hierarchy

## Visual Component Tree

```
HrSideForm (index.jsx)
│
├── TabNavigation
│   ├── Tab: Performance Assessment
│   ├── Tab: Assign Additional Assessment (conditional)
│   ├── Tab: Review Assigned Employees (conditional)
│   └── Tab: View All Reviews (conditional)
│
├── [Active Tab Content]
│   │
│   ├── AssessmentTab (when activeTab === 'assessment')
│   │   ├── FilterButtons (Direct Reviews)
│   │   ├── Import/Export Controls
│   │   │   ├── Download Template Button
│   │   │   └── Bulk Import Toggle Button
│   │   │
│   │   ├── ImportModePanel (when showImportMode === true)
│   │   │   ├── ExcelImportService
│   │   │   ├── Data Preview Table
│   │   │   └── Submit Button
│   │   │
│   │   └── AssessmentGrid (when showImportMode === false)
│   │       ├── Table Header
│   │       │   ├── Employee Column
│   │       │   ├── Category Columns (Performance, Discipline, Integrity)
│   │       │   ├── Final Score Column
│   │       │   └── Final Remark Column
│   │       │
│   │       └── Table Body
│   │           └── Employee Rows
│   │               ├── Employee Info Cell
│   │               ├── Parameter Input Cells (dropdowns)
│   │               ├── Category Score Cells (calculated)
│   │               ├── Final Score Cell (calculated)
│   │               └── Final Remark Cell (textarea)
│   │
│   ├── RandomAssessmentTab (when activeTab === 'random')
│   │   ├── EmployeeSearchDropdown (Assessor)
│   │   ├── EmployeeSearchDropdown (Assessees - multi-select)
│   │   ├── Selected Assessees List
│   │   └── Submit Button
│   │
│   ├── ReviewAssignedTab (when activeTab === 'reviewAssigned')
│   │   ├── FilterButtons (Assigned Reviews)
│   │   ├── EmployeeSearchDropdown (Select Assigned Employee)
│   │   └── AssessmentGrid (for selected employee)
│   │
│   └── ViewAllReviewsTab (when activeTab === 'viewAllReviews')
│       ├── EmployeeSearchDropdown (Select Employee)
│       ├── Reviews List
│       │   └── Review Cards
│       │       ├── Review Summary
│       │       ├── View Details Button
│       │       └── Regularize Button
│       │
│       ├── ReviewDetailModal (when selectedReviewDetail !== null)
│       │   ├── Modal Header
│       │   ├── Review Information
│       │   ├── Parameter Breakdown
│       │   │   ├── Performance Parameters
│       │   │   ├── Discipline Parameters
│       │   │   └── Integrity Parameters
│       │   └── Close Button
│       │
│       └── RegularizationModal (when selectedReviewForRegularization !== null)
│           ├── Modal Header
│           ├── Form Fields
│           │   ├── Performance Parameters Inputs
│           │   ├── Discipline Parameters Inputs
│           │   ├── Integrity Parameters Inputs
│           │   └── Final Remark Textarea
│           ├── Submit Button
│           └── Cancel Button
│
└── Empty State (when !selectedSessionId)
    ├── Icon
    ├── Title
    └── Description
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      HrSideForm (Main)                      │
│                                                             │
│  Props:                                                     │
│  - selectedSessionId                                        │
│  - reviewSessions                                           │
│  - areReviewsLocked                                         │
│  - isHindi                                                  │
│  - reviewStats                                              │
│  - overallFilter                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────────────────┐
                              │                                 │
                              ▼                                 ▼
                    ┌──────────────────┐            ┌──────────────────┐
                    │  Custom Hooks    │            │   UI Components  │
                    │                  │            │                  │
                    │ • useReview      │            │ • TabNavigation  │
                    │   Parameters     │            │ • FilterButtons  │
                    │ • useAssessment  │            │ • Employee       │
                    │   Data           │            │   SearchDropdown │
                    │ • useEmployee    │            │ • AssessmentGrid │
                    │   Search         │            │ • ImportMode     │
                    │ • useRandom      │            │   Panel          │
                    │   Assessment     │            │ • ReviewDetail   │
                    │ • useAssigned    │            │   Modal          │
                    │   Reviews        │            │ • Regularization │
                    │ • useViewAll     │            │   Modal          │
                    │   Reviews        │            │                  │
                    └──────────────────┘            └──────────────────┘
                              │                                 │
                              └─────────────┬───────────────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │    Utility Functions     │
                              │                          │
                              │ • calculationHelpers.js  │
                              │   - Score calculations   │
                              │   - Filtering logic      │
                              │                          │
                              │ • apiHelpers.js          │
                              │   - API calls            │
                              │   - Data submission      │
                              │                          │
                              │ • constants.js           │
                              │   - Configuration        │
                              │   - Field mappings       │
                              └──────────────────────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │      Backend API         │
                              │                          │
                              │ • /ReviewParameters      │
                              │ • /EmpAssessments        │
                              │ • /RandomAssessments     │
                              │ • /Employees             │
                              └──────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Global State (Main)                      │
├─────────────────────────────────────────────────────────────┤
│ • activeTab                                                 │
│ • selectedSessionId (from props)                            │
│ • areReviewsLocked (from props)                             │
│ • isHindi (from props)                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Assessment   │  │   Random     │  │  Assigned    │
    │ Tab State    │  │ Assessment   │  │  Reviews     │
    │              │  │  Tab State   │  │  Tab State   │
    ├──────────────┤  ├──────────────┤  ├──────────────┤
    │ • employees  │  │ • assessor   │  │ • assigned   │
    │ • assessment │  │ • assessees  │  │   Employees  │
    │   Data       │  │ • search     │  │ • selected   │
    │ • final      │  │   States     │  │   Employee   │
    │   Remarks    │  │              │  │ • assessment │
    │ • filters    │  │              │  │   Data       │
    │ • import     │  │              │  │ • filters    │
    │   Mode       │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## Hook Dependencies

```
useReviewParameters
│
├─> Used by: AssessmentTab, ReviewAssignedTab
│
└─> Provides: reviewParameters, categories, loadingParameters

useAssessmentData
│
├─> Depends on: reviewParameters
│
├─> Used by: AssessmentTab, ReviewAssignedTab
│
└─> Provides: assessmentData, finalRemarks, handlers

useEmployeeSearch
│
├─> Used by: RandomAssessmentTab, ReviewAssignedTab, ViewAllReviewsTab
│
└─> Provides: search state, filtered employees, handlers

useRandomAssessment
│
├─> Depends on: useEmployeeSearch (x2 instances)
│
├─> Used by: RandomAssessmentTab
│
└─> Provides: assessor/assessee state, submit handler

useAssignedReviews
│
├─> Depends on: useEmployeeSearch, useAssessmentData
│
├─> Used by: ReviewAssignedTab
│
└─> Provides: assigned employees, selection state, handlers

useViewAllReviews
│
├─> Depends on: useEmployeeSearch
│
├─> Used by: ViewAllReviewsTab
│
└─> Provides: reviews data, detail/regularization state, handlers
```

## Component Communication

```
Parent Component
       │
       │ Props
       ▼
   HrSideForm ◄──────────────────────┐
       │                             │
       │ Context/Props               │ Callbacks
       ▼                             │
   TabNavigation                     │
       │                             │
       │ Active Tab                  │
       ▼                             │
   Tab Components ───────────────────┘
       │
       │ Props
       ▼
   UI Components
       │
       │ Events
       ▼
   Custom Hooks
       │
       │ API Calls
       ▼
   Utility Functions
       │
       │ HTTP Requests
       ▼
   Backend API
```

## Reusability Map

### Highly Reusable (Can be used in other features)
- ✅ `EmployeeSearchDropdown` - Any employee selection
- ✅ `FilterButtons` - Any filtered list
- ✅ `useEmployeeSearch` - Any employee search functionality
- ✅ `calculationHelpers` - Any score calculations

### Moderately Reusable (Can be adapted)
- 🔄 `AssessmentGrid` - Similar grid layouts
- 🔄 `ImportModePanel` - Other Excel imports
- 🔄 `ReviewDetailModal` - Other detail views
- 🔄 `TabNavigation` - Other tabbed interfaces

### Feature-Specific (Specific to Performance Management)
- 🎯 `AssessmentTab` - Performance assessment only
- 🎯 `RandomAssessmentTab` - Random assessment only
- 🎯 `ReviewAssignedTab` - Assigned reviews only
- 🎯 `ViewAllReviewsTab` - Review viewing only
- 🎯 `RegularizationModal` - Regularization only
- 🎯 `useReviewParameters` - Review parameters only
- 🎯 `useAssessmentData` - Assessment data only

## Testing Strategy

```
Unit Tests
├── Utility Functions (calculationHelpers.js)
│   ├── calculateCategoryScore()
│   ├── calculateFinalPercentage()
│   ├── isEmployeeAssessed()
│   └── getFilteredEmployees()
│
├── API Helpers (apiHelpers.js)
│   ├── submitAssessments()
│   ├── submitBulkAssessments()
│   └── submitRandomAssessment()
│
└── Custom Hooks
    ├── useReviewParameters
    ├── useAssessmentData
    └── useEmployeeSearch

Integration Tests
├── Tab Components
│   ├── AssessmentTab
│   ├── RandomAssessmentTab
│   ├── ReviewAssignedTab
│   └── ViewAllReviewsTab
│
└── UI Components
    ├── AssessmentGrid
    ├── ImportModePanel
    └── EmployeeSearchDropdown

End-to-End Tests
└── Complete User Flows
    ├── Submit Assessment Flow
    ├── Import Excel Flow
    ├── Random Assignment Flow
    └── Regularization Flow
```