// Excel import field mapping
export const PREDEFINED_FIELDS = [
  { key: 'empNo', label: 'Emp No', required: true, variations: ['emp no', 'empno', 'employee number', 'employee no'] },
  { key: 'name', label: 'Name', required: true, variations: ['name', 'employee name', 'emp name'] },
  { key: 'department', label: 'Department', required: false, variations: ['department', 'dept'] },
  { key: 'manager', label: 'Manager', required: false, variations: ['manager', 'reporting manager'] },
  { key: 'selfDevelopment', label: 'Self Development', required: true, variations: ['self development', 'selfdevelopment'] },
  { key: 'employeeStaffDevelopment', label: 'Employee/Staff Development', required: true, variations: ['employee / staff development', 'employee staff development', 'staff development'] },
  { key: 'decisionMaking', label: 'Decision Making', required: true, variations: ['decision making', 'decisionmaking'] },
  { key: 'productivityEfficiency', label: 'Productivity/Efficiency', required: true, variations: ['productivity / efficiency - timely completion of targets', 'productivity efficiency', 'productivity', 'efficiency'] },
  { key: 'callForDuty', label: 'Call for Duty', required: true, variations: ['call for duty', 'callforduty'] },
  { key: 'performanceScore', label: 'Performance Score', required: false, variations: ['score', 'performance score'] },
  { key: 'attendancePunctuality', label: 'Attendance & Punctuality', required: true, variations: ['attendance & punctuality', 'attendance and punctuality', 'attendance'] },
  { key: 'behaviourOverallDiscipline', label: 'Behaviour/Overall Discipline', required: true, variations: ['behaviour/overall discipline', 'behaviour overall discipline', 'behaviour', 'discipline'] },
  { key: 'disciplineScore', label: 'Discipline Score', required: false, variations: ['score', 'discipline score'] },
  { key: 'integrity', label: 'Integrity', required: true, variations: ['integrity'] },
  { key: 'loyaltySubmissionToCompanyGoals', label: 'Loyalty/Submission to Company Goals', required: true, variations: ['loyalty/submission to company goals', 'loyalty submission to company goals', 'loyalty'] },
  { key: 'integrityScore', label: 'Integrity Score', required: false, variations: ['score', 'integrity score'] },
  { key: 'totalWeightage', label: 'Total Weightage', required: false, variations: ['total weightage', 'totalweightage', 'final score'] }
]

// Category weightages
export const CATEGORY_WEIGHTAGES = {
  PERFORMANCE: 0.60,
  DISCIPLINE: 0.20,
  INTEGRITY: 0.20
}

// Category IDs
export const CATEGORY_IDS = {
  PERFORMANCE: 1,
  DISCIPLINE: 2,
  INTEGRITY: 3
}

// Initial regularization form data
export const INITIAL_REGULARIZATION_FORM = {
  SelfDevelopment: 0,
  EmployeeStaffDevelopment: 0,
  DecisionMaking: 0,
  ProductivityEfficiency: 0,
  CallForDuty: 0,
  AttendancePunctuality: 0,
  BehaviourOverallDiscipline: 0,
  Integrity: 0,
  LoyaltySubmissionToCompanyGoals: 0,
  FinalRemark: ''
}

// Filter options for assessment filtering
export const FILTER_OPTIONS = {
  ALL: null,
  ASSESSED: 'assessed',
  REMAINING: 'remaining'
}

// Tab configuration
export const TABS = [
  {
    id: 'assessment',
    label: 'Assessment',
    labelHindi: 'मूल्यांकन',
    icon: 'Users'
  },
  {
    id: 'random',
    label: 'Random Assessment',
    labelHindi: 'यादृच्छिक मूल्यांकन',
    icon: 'Shuffle'
  },
  {
    id: 'assigned',
    label: 'Review Assigned',
    labelHindi: 'असाइन की गई समीक्षा',
    icon: 'UserCheck'
  },
  {
    id: 'viewAll',
    label: 'View All Reviews',
    labelHindi: 'सभी समीक्षाएं देखें',
    icon: 'Eye'
  }
]