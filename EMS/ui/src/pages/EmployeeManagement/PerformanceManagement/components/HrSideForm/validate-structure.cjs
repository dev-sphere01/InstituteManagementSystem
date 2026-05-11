/**
 * Validation Script for HrSideForm Refactoring
 * 
 * This script checks:
 * 1. All required files exist
 * 2. File structure is correct
 * 3. Basic syntax validation
 * 
 * Run with: node validate-structure.js
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Expected file structure
const expectedFiles = {
  documentation: [
    'README.md',
    'START_HERE.md',
    'SUMMARY.md',
    'COMPONENT_HIERARCHY.md',
    'REFACTORING_PROGRESS.md',
    'USAGE_EXAMPLES.md',
    'VISUAL_SUMMARY.md',
    'INDEX.md',
    'QUICK_START.md',
    'MIGRATION_GUIDE.md',
    'TESTING_GUIDE.md',
    'VALIDATION_CHECKLIST.md'
  ],
  utils: [
    'utils/constants.js',
    'utils/calculationHelpers.js',
    'utils/apiHelpers.js'
  ],
  hooks: [
    'hooks/useReviewParameters.js',
    'hooks/useAssessmentData.js',
    'hooks/useEmployeeSearch.js',
    'hooks/useRandomAssessment.js',
    'hooks/useAssignedReviews.js',
    'hooks/useViewAllReviews.js'
  ],
  components: [
    'components/TabNavigation.jsx',
    'components/FilterButtons.jsx',
    'components/EmployeeSearchDropdown.jsx',
    'components/AssessmentGrid.jsx',
    'components/ImportModePanel.jsx',
    'components/ReviewDetailModal.jsx',
    'components/RegularizationModal.jsx'
  ],
  tabs: [
    'tabs/AssessmentTab.jsx',
    'tabs/RandomAssessmentTab.jsx',
    'tabs/ReviewAssignedTab.jsx',
    'tabs/ViewAllReviewsTab.jsx'
  ],
  main: [
    'index.jsx'
  ]
}

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
}

/**
 * Print colored message
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Print section header
 */
function printHeader(title) {
  console.log('\n' + '='.repeat(60))
  print(title, 'cyan')
  console.log('='.repeat(60))
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return (stats.size / 1024).toFixed(2)
  } catch (error) {
    return 0
  }
}

/**
 * Count lines in file
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return content.split('\n').length
  } catch (error) {
    return 0
  }
}

/**
 * Check for basic syntax errors in JS/JSX files
 */
function checkSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const issues = []

    // Check for common issues
    const openBraces = (content.match(/{/g) || []).length
    const closeBraces = (content.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      issues.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`)
    }

    const openParens = (content.match(/\(/g) || []).length
    const closeParens = (content.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      issues.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`)
    }

    const openBrackets = (content.match(/\[/g) || []).length
    const closeBrackets = (content.match(/]/g) || []).length
    if (openBrackets !== closeBrackets) {
      issues.push(`Mismatched brackets: ${openBrackets} open, ${closeBrackets} close`)
    }

    // Check for export statement
    if (!content.includes('export')) {
      issues.push('No export statement found')
    }

    return issues
  } catch (error) {
    return [`Error reading file: ${error.message}`]
  }
}

/**
 * Validate file structure
 */
function validateStructure() {
  printHeader('📁 File Structure Validation')

  let totalFiles = 0
  let existingFiles = 0

  for (const [category, files] of Object.entries(expectedFiles)) {
    print(`\n${category.toUpperCase()}:`, 'blue')
    
    for (const file of files) {
      totalFiles++
      const filePath = path.join(__dirname, file)
      const exists = fileExists(filePath)
      
      if (exists) {
        existingFiles++
        results.passed++
        const size = getFileSize(filePath)
        const lines = countLines(filePath)
        print(`  ✓ ${file} (${lines} lines, ${size} KB)`, 'green')
      } else {
        results.failed++
        results.errors.push(`Missing file: ${file}`)
        print(`  ✗ ${file} - MISSING`, 'red')
      }
    }
  }

  print(`\nTotal: ${existingFiles}/${totalFiles} files exist`, 
    existingFiles === totalFiles ? 'green' : 'yellow')
}

/**
 * Validate syntax
 */
function validateSyntax() {
  printHeader('🔍 Syntax Validation')

  const jsFiles = [
    ...expectedFiles.utils,
    ...expectedFiles.hooks,
    ...expectedFiles.components,
    ...expectedFiles.tabs,
    ...expectedFiles.main
  ]

  let filesChecked = 0
  let filesWithIssues = 0

  for (const file of jsFiles) {
    const filePath = path.join(__dirname, file)
    
    if (!fileExists(filePath)) {
      continue
    }

    filesChecked++
    const issues = checkSyntax(filePath)
    
    if (issues.length === 0) {
      results.passed++
      print(`  ✓ ${file}`, 'green')
    } else {
      filesWithIssues++
      results.warnings++
      print(`  ⚠ ${file}`, 'yellow')
      issues.forEach(issue => {
        print(`    - ${issue}`, 'yellow')
      })
    }
  }

  print(`\nChecked: ${filesChecked} files`, 'blue')
  print(`Issues found: ${filesWithIssues} files`, 
    filesWithIssues === 0 ? 'green' : 'yellow')
}

/**
 * Validate imports
 */
function validateImports() {
  printHeader('📦 Import Validation')

  const mainFile = path.join(__dirname, 'index.jsx')
  
  if (!fileExists(mainFile)) {
    print('  ✗ Main file (index.jsx) not found', 'red')
    results.failed++
    return
  }

  try {
    const content = fs.readFileSync(mainFile, 'utf8')
    const imports = content.match(/import .+ from ['"].+['"]/g) || []
    
    print(`\nFound ${imports.length} import statements:`, 'blue')
    
    const categories = {
      react: [],
      external: [],
      internal: [],
      relative: []
    }

    imports.forEach(imp => {
      if (imp.includes('from \'react\'') || imp.includes('from "react"')) {
        categories.react.push(imp)
      } else if (imp.includes('from \'@/') || imp.includes('from "@/')) {
        categories.internal.push(imp)
      } else if (imp.includes('from \'./') || imp.includes('from "./')) {
        categories.relative.push(imp)
      } else {
        categories.external.push(imp)
      }
    })

    print(`\n  React: ${categories.react.length}`, 'green')
    print(`  External: ${categories.external.length}`, 'green')
    print(`  Internal (@/): ${categories.internal.length}`, 'green')
    print(`  Relative (./): ${categories.relative.length}`, 'green')

    results.passed++
  } catch (error) {
    print(`  ✗ Error reading main file: ${error.message}`, 'red')
    results.failed++
  }
}

/**
 * Generate summary report
 */
function generateSummary() {
  printHeader('📊 Validation Summary')

  const total = results.passed + results.failed + results.warnings
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0

  print(`\nTotal Checks: ${total}`, 'blue')
  print(`Passed: ${results.passed}`, 'green')
  print(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  print(`Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green')
  print(`Pass Rate: ${passRate}%`, passRate >= 90 ? 'green' : 'yellow')

  if (results.errors.length > 0) {
    print('\n❌ Critical Errors:', 'red')
    results.errors.forEach(error => {
      print(`  - ${error}`, 'red')
    })
  }

  // Overall status
  print('\n' + '='.repeat(60), 'cyan')
  if (results.failed === 0 && results.warnings === 0) {
    print('✅ ALL CHECKS PASSED - READY FOR TESTING', 'green')
  } else if (results.failed === 0) {
    print('⚠️  PASSED WITH WARNINGS - REVIEW RECOMMENDED', 'yellow')
  } else {
    print('❌ VALIDATION FAILED - FIXES REQUIRED', 'red')
  }
  print('='.repeat(60) + '\n', 'cyan')
}

/**
 * Main execution
 */
function main() {
  console.clear()
  print('\n🚀 HrSideForm Refactoring Validation', 'cyan')
  print('Starting validation process...\n', 'blue')

  try {
    validateStructure()
    validateSyntax()
    validateImports()
    generateSummary()
  } catch (error) {
    print(`\n❌ Validation failed with error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run validation
main()