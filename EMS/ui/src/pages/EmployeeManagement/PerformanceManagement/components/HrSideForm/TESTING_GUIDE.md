# 🧪 Testing Guide: HrSideForm Refactored Components

## Overview
Comprehensive testing guide for the refactored HrSideForm component architecture.

---

## 🎯 Testing Strategy

### 1. Unit Tests (Individual Files)
Test each utility, hook, and component in isolation.

### 2. Integration Tests (Component Groups)
Test how components work together.

### 3. End-to-End Tests (Full Workflows)
Test complete user journeys.

---

## 📁 Unit Testing

### Testing Utilities

#### `utils/constants.js`
```javascript
// No testing needed - just constants
// Verify values are correct by inspection
```

#### `utils/calculationHelpers.js`
```javascript
import { 
  calculateCategoryScore, 
  calculateFinalPercentage,
  getCategoryWeightage 
} from './calculationHelpers'

describe('calculationHelpers', () => {
  const mockAssessmentData = {
    '101_1': 3,
    '101_2': 4,
    '101_3': 5
  }
  
  const mockReviewParameters = [
    { ReviewParameterID: 1, CategoryID: 1, Weightage: 10 },
    { ReviewParameterID: 2, CategoryID: 1, Weightage: 15 },
    { ReviewParameterID: 3, CategoryID: 2, Weightage: 20 }
  ]
  
  const mockCategories = [
    { id: 1, weightage: 40 },
    { id: 2, weightage: 60 }
  ]

  test('calculateCategoryScore returns correct score', () => {
    const score = calculateCategoryScore(
      '101',
      1,
      mockAssessmentData,
      mockReviewParameters,
      mockCategories
    )
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  test('calculateFinalPercentage returns correct percentage', () => {
    const percentage = calculateFinalPercentage(
      '101',
      mockAssessmentData,
      mockReviewParameters,
      mockCategories
    )
    expect(percentage).toBeGreaterThanOrEqual(0)
    expect(percentage).toBeLessThanOrEqual(100)
  })

  test('getCategoryWeightage returns correct weightage', () => {
    const weightage = getCategoryWeightage(1, mockCategories)
    expect(weightage).toBe(40)
  })
})
```

#### `utils/apiHelpers.js`
```javascript
import { 
  fetchReviewParameters,
  fetchEmployeesBySession,
  submitAssessments 
} from './apiHelpers'
import { API } from '@/services'

jest.mock('@/services', () => ({
  API: {
    get: jest.fn(),
    post: jest.fn()
  }
}))

describe('apiHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetchReviewParameters calls correct endpoint', async () => {
    API.get.mockResolvedValue({ data: [] })
    await fetchReviewParameters(123)
    expect(API.get).toHaveBeenCalledWith('/api/review-parameters/123')
  })

  test('submitAssessments sends correct data', async () => {
    const mockData = { assessments: [] }
    API.post.mockResolvedValue({ success: true })
    await submitAssessments(mockData)
    expect(API.post).toHaveBeenCalledWith('/api/submit-assessments', mockData)
  })
})
```

### Testing Hooks

#### `hooks/useReviewParameters.js`
```javascript
import { renderHook, waitFor } from '@testing-library/react'
import useReviewParameters from './useReviewParameters'
import { fetchReviewParameters, fetchCategories } from '../utils/apiHelpers'

jest.mock('../utils/apiHelpers')

describe('useReviewParameters', () => {
  test('fetches parameters on mount', async () => {
    fetchReviewParameters.mockResolvedValue([])
    fetchCategories.mockResolvedValue([])
    
    const { result } = renderHook(() => useReviewParameters(123))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(fetchReviewParameters).toHaveBeenCalledWith(123)
  })

  test('handles errors gracefully', async () => {
    fetchReviewParameters.mockRejectedValue(new Error('API Error'))
    
    const { result } = renderHook(() => useReviewParameters(123))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.reviewParameters).toEqual([])
  })
})
```

#### `hooks/useAssessmentData.js`
```javascript
import { renderHook, act } from '@testing-library/react'
import useAssessmentData from './useAssessmentData'

describe('useAssessmentData', () => {
  test('initializes with empty data', () => {
    const { result } = renderHook(() => useAssessmentData())
    expect(result.current.assessmentData).toEqual({})
    expect(result.current.finalRemarks).toEqual({})
  })

  test('updates assessment data correctly', () => {
    const { result } = renderHook(() => useAssessmentData())
    
    act(() => {
      result.current.handleAssessmentChange('101', 1, '3')
    })
    
    expect(result.current.assessmentData['101_1']).toBe(3)
  })

  test('updates final remarks correctly', () => {
    const { result } = renderHook(() => useAssessmentData())
    
    act(() => {
      result.current.handleFinalRemarkChange('101', 'Good performance')
    })
    
    expect(result.current.finalRemarks['101']).toBe('Good performance')
  })
})
```

### Testing Components

#### `components/TabNavigation.jsx`
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import TabNavigation from './TabNavigation'

describe('TabNavigation', () => {
  const mockOnTabChange = jest.fn()
  const tabs = [
    { id: 'assessment', label: 'Assessment', icon: 'Users' },
    { id: 'random', label: 'Random', icon: 'Shuffle' }
  ]

  test('renders all tabs', () => {
    render(
      <TabNavigation 
        tabs={tabs}
        activeTab="assessment"
        onTabChange={mockOnTabChange}
      />
    )
    
    expect(screen.getByText('Assessment')).toBeInTheDocument()
    expect(screen.getByText('Random')).toBeInTheDocument()
  })

  test('calls onTabChange when tab clicked', () => {
    render(
      <TabNavigation 
        tabs={tabs}
        activeTab="assessment"
        onTabChange={mockOnTabChange}
      />
    )
    
    fireEvent.click(screen.getByText('Random'))
    expect(mockOnTabChange).toHaveBeenCalledWith('random')
  })

  test('highlights active tab', () => {
    render(
      <TabNavigation 
        tabs={tabs}
        activeTab="assessment"
        onTabChange={mockOnTabChange}
      />
    )
    
    const activeTab = screen.getByText('Assessment').closest('button')
    expect(activeTab).toHaveClass('bg-blue-500')
  })
})
```

#### `components/FilterButtons.jsx`
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import FilterButtons from './FilterButtons'

describe('FilterButtons', () => {
  const mockOnFilterChange = jest.fn()

  test('renders all filter buttons', () => {
    render(
      <FilterButtons
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
        counts={{ all: 10, pending: 5, completed: 5 }}
        isHindi={false}
      />
    )
    
    expect(screen.getByText(/All/)).toBeInTheDocument()
    expect(screen.getByText(/Pending/)).toBeInTheDocument()
    expect(screen.getByText(/Completed/)).toBeInTheDocument()
  })

  test('displays correct counts', () => {
    render(
      <FilterButtons
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
        counts={{ all: 10, pending: 5, completed: 5 }}
        isHindi={false}
      />
    )
    
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('calls onFilterChange when clicked', () => {
    render(
      <FilterButtons
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
        counts={{ all: 10, pending: 5, completed: 5 }}
        isHindi={false}
      />
    )
    
    fireEvent.click(screen.getByText(/Pending/))
    expect(mockOnFilterChange).toHaveBeenCalledWith('pending')
  })
})
```

#### `components/AssessmentGrid.jsx`
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import AssessmentGrid from './AssessmentGrid'

describe('AssessmentGrid', () => {
  const mockProps = {
    employees: [
      { EmpID: '101', FirstName: 'John', LastName: 'Doe' }
    ],
    categories: [
      { id: 1, name: 'Technical', nameHindi: 'तकनीकी', weightage: 50 }
    ],
    reviewParameters: [
      { 
        ReviewParameterID: 1, 
        CategoryID: 1,
        ParameterName: 'Coding',
        ParameterNameHindi: 'कोडिंग',
        OptionsEnglish: ['Poor', 'Good', 'Excellent'],
        OptionsHindi: ['खराब', 'अच्छा', 'उत्कृष्ट'],
        Weightage: 10
      }
    ],
    assessmentData: {},
    finalRemarks: {},
    isHindi: false,
    areReviewsLocked: false,
    onAssessmentChange: jest.fn(),
    onFinalRemarkChange: jest.fn(),
    calculateCategoryScore: jest.fn(() => 75),
    calculateFinalPercentage: jest.fn(() => 80),
    getCategoryWeightage: jest.fn(() => 50)
  }

  test('renders employee information', () => {
    render(<AssessmentGrid {...mockProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('ID: 101')).toBeInTheDocument()
  })

  test('renders parameter dropdowns', () => {
    render(<AssessmentGrid {...mockProps} />)
    expect(screen.getByText('Coding')).toBeInTheDocument()
  })

  test('calls onAssessmentChange when dropdown changed', () => {
    render(<AssessmentGrid {...mockProps} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '2' } })
    expect(mockProps.onAssessmentChange).toHaveBeenCalled()
  })

  test('disables inputs when locked', () => {
    render(<AssessmentGrid {...mockProps} areReviewsLocked={true} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  test('displays calculated scores', () => {
    render(<AssessmentGrid {...mockProps} />)
    expect(screen.getByText('75.0')).toBeInTheDocument()
    expect(screen.getByText('80.0%')).toBeInTheDocument()
  })
})
```

---

## 🔗 Integration Testing

### Testing Tab Components

#### `tabs/AssessmentTab.jsx`
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AssessmentTab from './AssessmentTab'

describe('AssessmentTab Integration', () => {
  const mockProps = {
    employees: [
      { EmpID: '101', FirstName: 'John', LastName: 'Doe' }
    ],
    filteredEmployees: [
      { EmpID: '101', FirstName: 'John', LastName: 'Doe' }
    ],
    categories: [],
    reviewParameters: [],
    assessmentData: {},
    finalRemarks: {},
    activeFilter: 'all',
    isImportMode: false,
    importedData: [],
    isHindi: false,
    areReviewsLocked: false,
    isSubmitting: false,
    onFilterChange: jest.fn(),
    onImportModeToggle: jest.fn(),
    onAssessmentChange: jest.fn(),
    onFinalRemarkChange: jest.fn(),
    onImportDataChange: jest.fn(),
    onSubmit: jest.fn(),
    calculateCategoryScore: jest.fn(() => 75),
    calculateFinalPercentage: jest.fn(() => 80),
    getCategoryWeightage: jest.fn(() => 50)
  }

  test('renders all sub-components', () => {
    render(<AssessmentTab {...mockProps} />)
    expect(screen.getByText(/Employee/)).toBeInTheDocument()
  })

  test('toggles import mode', () => {
    render(<AssessmentTab {...mockProps} />)
    const toggleButton = screen.getByText(/Import Mode/)
    fireEvent.click(toggleButton)
    expect(mockProps.onImportModeToggle).toHaveBeenCalled()
  })

  test('submits assessment data', async () => {
    render(<AssessmentTab {...mockProps} />)
    const submitButton = screen.getByText(/Submit/)
    fireEvent.click(submitButton)
    expect(mockProps.onSubmit).toHaveBeenCalled()
  })
})
```

### Testing Main Component

#### `index.jsx`
```javascript
import { render, screen, waitFor } from '@testing-library/react'
import HrSideForm from './index'
import * as apiHelpers from './utils/apiHelpers'

jest.mock('./utils/apiHelpers')
jest.mock('@/store/empDataStore')

describe('HrSideForm Main Component', () => {
  const mockProps = {
    selectedSessionId: 123,
    reviewSessions: [{ id: 123, name: 'Q1 2024' }],
    loadingSessions: false,
    areReviewsLocked: false,
    setAreReviewsLocked: jest.fn(),
    isHindi: false,
    setIsHindi: jest.fn(),
    reviewStats: {},
    loadingStats: false,
    overallFilter: 'all'
  }

  beforeEach(() => {
    apiHelpers.fetchReviewParameters.mockResolvedValue([])
    apiHelpers.fetchCategories.mockResolvedValue([])
    apiHelpers.fetchEmployeesBySession.mockResolvedValue([])
  })

  test('renders tab navigation', async () => {
    render(<HrSideForm {...mockProps} />)
    await waitFor(() => {
      expect(screen.getByText(/Assessment/)).toBeInTheDocument()
    })
  })

  test('fetches data on mount', async () => {
    render(<HrSideForm {...mockProps} />)
    await waitFor(() => {
      expect(apiHelpers.fetchReviewParameters).toHaveBeenCalledWith(123)
    })
  })

  test('shows empty state when no session selected', () => {
    render(<HrSideForm {...mockProps} selectedSessionId={null} />)
    expect(screen.getByText(/Select a session/)).toBeInTheDocument()
  })
})
```

---

## 🎭 End-to-End Testing

### Complete User Workflows

#### Workflow 1: Submit Assessment
```javascript
describe('E2E: Submit Assessment Workflow', () => {
  test('user can complete full assessment', async () => {
    // 1. Render component
    render(<HrSideForm {...mockProps} />)
    
    // 2. Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    // 3. Select assessment value
    const dropdown = screen.getByRole('combobox')
    fireEvent.change(dropdown, { target: { value: '3' } })
    
    // 4. Enter final remark
    const textarea = screen.getByPlaceholderText(/final remarks/)
    fireEvent.change(textarea, { target: { value: 'Good work' } })
    
    // 5. Submit
    const submitButton = screen.getByText(/Submit/)
    fireEvent.click(submitButton)
    
    // 6. Verify success
    await waitFor(() => {
      expect(screen.getByText(/Success/)).toBeInTheDocument()
    })
  })
})
```

#### Workflow 2: Random Assessment Assignment
```javascript
describe('E2E: Random Assessment Assignment', () => {
  test('user can assign random assessments', async () => {
    // 1. Switch to Random tab
    render(<HrSideForm {...mockProps} />)
    fireEvent.click(screen.getByText(/Random/))
    
    // 2. Select assessor
    const assessorDropdown = screen.getByLabelText(/Assessor/)
    fireEvent.change(assessorDropdown, { target: { value: '101' } })
    
    // 3. Search and select assessees
    const searchInput = screen.getByPlaceholderText(/Search/)
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    // 4. Click on employee to add
    await waitFor(() => {
      fireEvent.click(screen.getByText('John Doe'))
    })
    
    // 5. Submit assignment
    const submitButton = screen.getByText(/Assign/)
    fireEvent.click(submitButton)
    
    // 6. Verify success
    await waitFor(() => {
      expect(screen.getByText(/Assigned successfully/)).toBeInTheDocument()
    })
  })
})
```

---

## 🚀 Running Tests

### Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- AssessmentGrid.test.jsx
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

---

## 📊 Coverage Goals

### Target Coverage
- **Utilities**: 100%
- **Hooks**: 90%+
- **Components**: 85%+
- **Integration**: 80%+
- **E2E**: 70%+

### Critical Paths (Must be 100%)
- Assessment submission
- Score calculations
- Data persistence
- Error handling

---

## 🐛 Manual Testing Checklist

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

### Performance Testing
- [ ] Initial load < 3s
- [ ] Tab switching < 500ms
- [ ] Form submission < 2s
- [ ] No memory leaks

---

## 📝 Test Documentation

### Writing Good Tests
1. **Descriptive names**: `test('displays error when API fails')`
2. **Arrange-Act-Assert**: Clear test structure
3. **One assertion per test**: Focus on single behavior
4. **Mock external dependencies**: Isolate unit under test
5. **Test edge cases**: Empty data, errors, boundaries

### Test Maintenance
1. Update tests when requirements change
2. Remove obsolete tests
3. Refactor duplicated test code
4. Keep tests fast and focused

---

## ✅ Definition of Done

Tests are complete when:
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Coverage goals met
- [ ] Manual testing complete
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Documentation updated

---

*Last Updated: 2024*
*Version: 1.0.0*