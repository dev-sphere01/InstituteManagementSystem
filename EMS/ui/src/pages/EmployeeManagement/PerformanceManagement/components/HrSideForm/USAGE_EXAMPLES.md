# Usage Examples

## Using the Refactored HrSideForm

### Basic Usage (Same as Before)

```javascript
import HrSideForm from './components/HrSideForm'

function PerformanceManagement() {
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [areReviewsLocked, setAreReviewsLocked] = useState(false)
  const [isHindi, setIsHindi] = useState(false)
  
  return (
    <HrSideForm
      selectedSessionId={selectedSessionId}
      reviewSessions={reviewSessions}
      loadingSessions={loadingSessions}
      areReviewsLocked={areReviewsLocked}
      setAreReviewsLocked={setAreReviewsLocked}
      isHindi={isHindi}
      setIsHindi={setIsHindi}
      reviewStats={reviewStats}
      loadingStats={loadingStats}
      overallFilter={overallFilter}
    />
  )
}
```

## Using Individual Components

### 1. Using EmployeeSearchDropdown

```javascript
import EmployeeSearchDropdown from './components/HrSideForm/components/EmployeeSearchDropdown'
import { useEmployeeSearch } from './components/HrSideForm/hooks/useEmployeeSearch'
import useEmpDataStore from '@/store/empDataStore'

function MyComponent() {
  const [allEmployees, setAllEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const { getEmployeeDisplayName } = useEmpDataStore()
  
  const employeeSearch = useEmployeeSearch(allEmployees)
  
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee)
    employeeSearch.resetSearch()
  }
  
  const handleClearSelection = () => {
    setSelectedEmployee(null)
    employeeSearch.resetSearch()
  }
  
  return (
    <EmployeeSearchDropdown
      label="Select Employee"
      placeholder="Search by name, employee number, or department..."
      searchTerm={employeeSearch.searchTerm}
      onSearchChange={employeeSearch.setSearchTerm}
      showDropdown={employeeSearch.showDropdown}
      onDropdownToggle={employeeSearch.handleDropdownToggle}
      filteredEmployees={employeeSearch.filteredEmployees}
      onEmployeeSelect={handleEmployeeSelect}
      selectedEmployee={selectedEmployee}
      onClearSelection={handleClearSelection}
      dropdownRef={employeeSearch.dropdownRef}
      inputRef={employeeSearch.inputRef}
      getEmployeeDisplayName={getEmployeeDisplayName}
    />
  )
}
```

### 2. Using FilterButtons

```javascript
import FilterButtons from './components/HrSideForm/components/FilterButtons'

function MyComponent() {
  const [activeFilter, setActiveFilter] = useState(null)
  
  const reviewStats = {
    DirectReviews: {
      TotalEmployees: 50,
      Completed: 30,
      Remaining: 20
    }
  }
  
  const handleFilterClick = (filterType) => {
    setActiveFilter(prev => prev === filterType ? null : filterType)
  }
  
  return (
    <FilterButtons
      reviewStats={reviewStats}
      activeFilter={activeFilter}
      onFilterClick={handleFilterClick}
      type="direct"
    />
  )
}
```

### 3. Using Calculation Helpers

```javascript
import {
  calculateCategoryScore,
  calculateFinalPercentage,
  isEmployeeAssessed,
  getFilteredEmployees
} from './components/HrSideForm/utils/calculationHelpers'

function MyComponent() {
  const [assessmentData, setAssessmentData] = useState({})
  const [reviewParameters, setReviewParameters] = useState([])
  const [employees, setEmployees] = useState([])
  
  // Calculate score for an employee
  const empId = 123
  const categoryId = 1 // Performance
  const score = calculateCategoryScore(empId, categoryId, reviewParameters, assessmentData)
  
  // Calculate final percentage
  const finalPercentage = calculateFinalPercentage(empId, reviewParameters, assessmentData)
  
  // Check if employee is assessed
  const isAssessed = isEmployeeAssessed(empId, reviewParameters, assessmentData)
  
  // Filter employees
  const assessedEmployees = getFilteredEmployees(employees, 'assessed', reviewParameters, assessmentData)
  const remainingEmployees = getFilteredEmployees(employees, 'remaining', reviewParameters, assessmentData)
  
  return (
    <div>
      <p>Score: {score}</p>
      <p>Final: {finalPercentage}%</p>
      <p>Status: {isAssessed ? 'Assessed' : 'Not Assessed'}</p>
    </div>
  )
}
```

### 4. Using API Helpers

```javascript
import {
  submitAssessments,
  submitBulkAssessments,
  fetchDirectReportEmployees
} from './components/HrSideForm/utils/apiHelpers'
import { notification } from '@/services'

function MyComponent() {
  const notify = notification()
  
  const handleSubmit = async () => {
    try {
      const count = await submitAssessments({
        employeeList: employees,
        selectedSessionId: sessionId,
        reviewParameters: parameters,
        assessmentData: data,
        finalRemarks: remarks,
        currentEmployee: currentEmp
      })
      
      notify.success(`Successfully submitted ${count} assessment(s)!`)
    } catch (error) {
      notify.error(error.message)
    }
  }
  
  const loadEmployees = async () => {
    try {
      const employees = await fetchDirectReportEmployees(empId)
      setEmployees(employees)
    } catch (error) {
      notify.error('Failed to load employees')
    }
  }
  
  return (
    <button onClick={handleSubmit}>Submit Assessments</button>
  )
}
```

### 5. Using useReviewParameters Hook

```javascript
import { useReviewParameters } from './components/HrSideForm/hooks/useReviewParameters'

function MyComponent() {
  const {
    reviewParameters,
    categories,
    loadingParameters,
    reloadParameters
  } = useReviewParameters()
  
  if (loadingParameters) {
    return <div>Loading parameters...</div>
  }
  
  return (
    <div>
      <h3>Categories</h3>
      {categories.map(cat => (
        <div key={cat.id}>
          <h4>{cat.name}</h4>
          <ul>
            {reviewParameters
              .filter(p => p.CategoryID === cat.id)
              .map(param => (
                <li key={param.ReviewParameterID}>
                  {param.ParameterName}
                </li>
              ))}
          </ul>
        </div>
      ))}
      
      <button onClick={reloadParameters}>Reload</button>
    </div>
  )
}
```

### 6. Using useAssessmentData Hook

```javascript
import { useAssessmentData } from './components/HrSideForm/hooks/useAssessmentData'
import { useReviewParameters } from './components/HrSideForm/hooks/useReviewParameters'
import useEmpDataStore from '@/store/empDataStore'

function MyComponent() {
  const { currentEmployee } = useEmpDataStore()
  const { reviewParameters } = useReviewParameters()
  const {
    assessmentData,
    finalRemarks,
    loadExistingReviews,
    handleAssessmentChange,
    handleFinalRemarkChange
  } = useAssessmentData(reviewParameters)
  
  useEffect(() => {
    if (currentEmployee && sessionId) {
      loadExistingReviews(currentEmployee, sessionId)
    }
  }, [currentEmployee, sessionId])
  
  return (
    <div>
      <input
        type="number"
        value={assessmentData['123_1'] || 0}
        onChange={(e) => handleAssessmentChange(123, 1, e.target.value)}
      />
      
      <textarea
        value={finalRemarks[123] || ''}
        onChange={(e) => handleFinalRemarkChange(123, e.target.value)}
      />
    </div>
  )
}
```

## Advanced Usage Patterns

### Pattern 1: Combining Multiple Hooks

```javascript
import { useReviewParameters } from './hooks/useReviewParameters'
import { useAssessmentData } from './hooks/useAssessmentData'
import { useEmployeeSearch } from './hooks/useEmployeeSearch'

function AdvancedAssessmentForm() {
  // Load parameters
  const { reviewParameters, categories } = useReviewParameters()
  
  // Manage assessment data
  const assessmentData = useAssessmentData(reviewParameters)
  
  // Employee search
  const [allEmployees, setAllEmployees] = useState([])
  const employeeSearch = useEmployeeSearch(allEmployees)
  
  // Combine them
  return (
    <div>
      <EmployeeSearchDropdown {...employeeSearch} />
      <AssessmentForm
        parameters={reviewParameters}
        categories={categories}
        {...assessmentData}
      />
    </div>
  )
}
```

### Pattern 2: Custom Hook Composition

```javascript
// Create a custom hook that combines multiple hooks
function usePerformanceAssessment(sessionId) {
  const { currentEmployee } = useEmpDataStore()
  const { reviewParameters, categories } = useReviewParameters()
  const assessmentData = useAssessmentData(reviewParameters)
  const [employees, setEmployees] = useState([])
  
  useEffect(() => {
    if (currentEmployee) {
      fetchDirectReportEmployees(currentEmployee.EmpID)
        .then(setEmployees)
    }
  }, [currentEmployee])
  
  useEffect(() => {
    if (currentEmployee && sessionId) {
      assessmentData.loadExistingReviews(currentEmployee, sessionId)
    }
  }, [currentEmployee, sessionId])
  
  return {
    employees,
    reviewParameters,
    categories,
    ...assessmentData
  }
}

// Use it
function MyComponent({ sessionId }) {
  const assessment = usePerformanceAssessment(sessionId)
  
  return <AssessmentGrid {...assessment} />
}
```

### Pattern 3: Memoization for Performance

```javascript
import { useMemo } from 'react'
import { getFilteredEmployees, calculateFinalPercentage } from './utils/calculationHelpers'

function OptimizedEmployeeList({ employees, reviewParameters, assessmentData, filterType }) {
  // Memoize filtered employees
  const filteredEmployees = useMemo(() => {
    return getFilteredEmployees(employees, filterType, reviewParameters, assessmentData)
  }, [employees, filterType, reviewParameters, assessmentData])
  
  // Memoize calculated scores
  const employeeScores = useMemo(() => {
    return filteredEmployees.map(emp => ({
      ...emp,
      score: calculateFinalPercentage(emp.EmpID, reviewParameters, assessmentData)
    }))
  }, [filteredEmployees, reviewParameters, assessmentData])
  
  return (
    <div>
      {employeeScores.map(emp => (
        <div key={emp.EmpID}>
          {emp.Name}: {emp.score}%
        </div>
      ))}
    </div>
  )
}
```

### Pattern 4: Error Boundary Integration

```javascript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset app state
      }}
    >
      <HrSideForm {...props} />
    </ErrorBoundary>
  )
}
```

## Testing Examples

### Testing Utility Functions

```javascript
import { calculateCategoryScore, calculateFinalPercentage } from './utils/calculationHelpers'

describe('calculationHelpers', () => {
  const reviewParameters = [
    { ReviewParameterID: 1, CategoryID: 1, ParameterName: 'Self Development' },
    { ReviewParameterID: 2, CategoryID: 1, ParameterName: 'Decision Making' }
  ]
  
  const assessmentData = {
    '123_1': 4,
    '123_2': 3
  }
  
  test('calculateCategoryScore returns correct average', () => {
    const score = calculateCategoryScore(123, 1, reviewParameters, assessmentData)
    expect(score).toBe(3.5)
  })
  
  test('calculateFinalPercentage returns correct weighted score', () => {
    const percentage = calculateFinalPercentage(123, reviewParameters, assessmentData)
    expect(percentage).toBeGreaterThan(0)
  })
})
```

### Testing Custom Hooks

```javascript
import { renderHook, act } from '@testing-library/react-hooks'
import { useEmployeeSearch } from './hooks/useEmployeeSearch'

describe('useEmployeeSearch', () => {
  const mockEmployees = [
    { EmpID: 1, Name: 'John Doe', EmpNo: '001', Department: 'IT' },
    { EmpID: 2, Name: 'Jane Smith', EmpNo: '002', Department: 'HR' }
  ]
  
  test('filters employees by search term', () => {
    const { result } = renderHook(() => useEmployeeSearch(mockEmployees))
    
    act(() => {
      result.current.setSearchTerm('John')
    })
    
    expect(result.current.filteredEmployees).toHaveLength(1)
    expect(result.current.filteredEmployees[0].Name).toBe('John Doe')
  })
  
  test('resets search', () => {
    const { result } = renderHook(() => useEmployeeSearch(mockEmployees))
    
    act(() => {
      result.current.setSearchTerm('John')
      result.current.resetSearch()
    })
    
    expect(result.current.searchTerm).toBe('')
    expect(result.current.filteredEmployees).toHaveLength(2)
  })
})
```

### Testing Components

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import FilterButtons from './components/FilterButtons'

describe('FilterButtons', () => {
  const mockReviewStats = {
    DirectReviews: {
      TotalEmployees: 50,
      Completed: 30,
      Remaining: 20
    }
  }
  
  test('renders all buttons', () => {
    render(
      <FilterButtons
        reviewStats={mockReviewStats}
        activeFilter={null}
        onFilterClick={jest.fn()}
        type="direct"
      />
    )
    
    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Assessed:')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })
  
  test('calls onFilterClick when button is clicked', () => {
    const mockOnFilterClick = jest.fn()
    
    render(
      <FilterButtons
        reviewStats={mockReviewStats}
        activeFilter={null}
        onFilterClick={mockOnFilterClick}
        type="direct"
      />
    )
    
    fireEvent.click(screen.getByText('Assessed:'))
    expect(mockOnFilterClick).toHaveBeenCalledWith('assessed')
  })
})
```

## Migration Checklist

When migrating from old to new structure:

- [ ] Backup original `HrSideForm.jsx`
- [ ] Complete all remaining components
- [ ] Test each component individually
- [ ] Test integration
- [ ] Update import in parent component
- [ ] Test in development environment
- [ ] Test all user flows
- [ ] Deploy to staging
- [ ] Get user acceptance testing
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Archive old file (don't delete immediately)

## Performance Tips

1. **Use React.memo for expensive components**
   ```javascript
   export default React.memo(AssessmentGrid)
   ```

2. **Memoize expensive calculations**
   ```javascript
   const score = useMemo(() => calculateFinalPercentage(...), [deps])
   ```

3. **Debounce search inputs**
   ```javascript
   const debouncedSearch = useMemo(
     () => debounce(setSearchTerm, 300),
     []
   )
   ```

4. **Virtualize long lists**
   ```javascript
   import { FixedSizeList } from 'react-window'
   ```

5. **Lazy load tab content**
   ```javascript
   const AssessmentTab = lazy(() => import('./tabs/AssessmentTab'))
   ```