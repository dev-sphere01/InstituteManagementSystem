# Employee Assessment Template Files

## Required Template Files

The following template files should be placed in the `public/templates/` directory:

### 1. English Template
- **File Name**: `EmployeeAssessment.xlsx`
- **Location**: `public/templates/EmployeeAssessment.xlsx`
- **Description**: English version of the employee assessment template

### 2. Hindi Template  
- **File Name**: `EmployeeAssessment (Hindi).xlsx`
- **Location**: `public/templates/EmployeeAssessment (Hindi).xlsx`
- **Description**: Hindi version of the employee assessment template

## Template Structure

Both templates should contain the following columns:

1. **Emp No** (कर्मचारी नं) - Employee Number
2. **Name** (नाम) - Employee Name
3. **Department** (विभाग) - Department (Optional)
4. **Manager** (प्रबंधक) - Manager (Optional)
5. **Self Development** (स्व विकास) - Self Development Score (0-4)
6. **Employee/Staff Development** (कर्मचारी/स्टाफ विकास) - Staff Development Score (0-4)
7. **Decision Making** (निर्णय लेना) - Decision Making Score (0-4)
8. **Productivity/Efficiency** (उत्पादकता/दक्षता) - Productivity Score (0-4)
9. **Call for Duty** (कॉल फॉर ड्यूटी) - Call for Duty Score (0-4)
10. **Attendance & Punctuality** (उपस्थिति और समयनिष्ठा) - Attendance Score (0-4)
11. **Behaviour/Overall Discipline** (व्यवहार/समग्र अनुशासन) - Behaviour Score (0-4)
12. **Integrity** (ईमानदारी) - Integrity Score (0-4)
13. **Loyalty/Submission to Company Goals** (वफादारी/कंपनी लक्ष्यों के प्रति समर्पण) - Loyalty Score (0-4)
14. **Final Remark** (अंतिम टिप्पणी) - Final Remarks (Optional)

## Usage

The system will automatically select the appropriate template based on the current language setting:
- If `isHindi = true`: Downloads `EmployeeAssessment (Hindi).xlsx`
- If `isHindi = false`: Downloads `EmployeeAssessment.xlsx`

## Implementation

The download functionality is implemented in the `ImportModePanel` component with language-aware template selection.