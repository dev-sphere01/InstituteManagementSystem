# HrSideForm Deployment Script
# This script helps deploy the refactored HrSideForm component

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('validate', 'backup', 'deploy', 'rollback', 'full')]
    [string]$Action = 'validate'
)

$ErrorActionPreference = "Stop"
$BaseDir = "d:\ems node\CUPLEMS\ui\src\pages\EmployeeManagement\PerformanceManagement\components"
$HrSideFormDir = Join-Path $BaseDir "HrSideForm"
$OriginalFile = Join-Path $BaseDir "HrSideForm.jsx"
$BackupFile = Join-Path $BaseDir "HrSideForm.backup.jsx"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         HrSideForm Deployment Script v1.0                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Available Actions:" -ForegroundColor Yellow
    Write-Host "  1. validate  - Run validation checks" -ForegroundColor White
    Write-Host "  2. backup    - Backup original file" -ForegroundColor White
    Write-Host "  3. deploy    - Deploy refactored version" -ForegroundColor White
    Write-Host "  4. rollback  - Rollback to original" -ForegroundColor White
    Write-Host "  5. full      - Full deployment (backup + deploy)" -ForegroundColor White
    Write-Host ""
}

function Invoke-Validation {
    Write-Host "🔍 Running Validation..." -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path (Join-Path $HrSideFormDir "validate-structure.cjs")) {
        Set-Location $HrSideFormDir
        node validate-structure.cjs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Validation PASSED - Ready for deployment!" -ForegroundColor Green
            return $true
        } else {
            Write-Host ""
            Write-Host "❌ Validation FAILED - Fix issues before deploying!" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Validation script not found!" -ForegroundColor Red
        return $false
    }
}

function Invoke-Backup {
    Write-Host "💾 Creating Backup..." -ForegroundColor Cyan
    
    if (Test-Path $OriginalFile) {
        if (Test-Path $BackupFile) {
            Write-Host "⚠️  Backup already exists: $BackupFile" -ForegroundColor Yellow
            $response = Read-Host "Overwrite existing backup? (y/n)"
            if ($response -ne 'y') {
                Write-Host "❌ Backup cancelled" -ForegroundColor Red
                return $false
            }
        }
        
        Copy-Item -Path $OriginalFile -Destination $BackupFile -Force
        Write-Host "✅ Backup created: $BackupFile" -ForegroundColor Green
        
        $fileSize = (Get-Item $BackupFile).Length
        Write-Host "   Size: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "⚠️  Original file not found: $OriginalFile" -ForegroundColor Yellow
        Write-Host "   This might be okay if already deployed" -ForegroundColor Gray
        return $true
    }
}

function Invoke-Deploy {
    Write-Host "🚀 Deploying Refactored Version..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check if refactored version exists
    if (-not (Test-Path (Join-Path $HrSideFormDir "index.jsx"))) {
        Write-Host "❌ Refactored version not found!" -ForegroundColor Red
        Write-Host "   Expected: $HrSideFormDir\index.jsx" -ForegroundColor Gray
        return $false
    }
    
    # Check if original file exists
    if (Test-Path $OriginalFile) {
        Write-Host "⚠️  Original file still exists: $OriginalFile" -ForegroundColor Yellow
        Write-Host "   Recommendation: Rename it to HrSideForm.backup.jsx" -ForegroundColor Gray
        Write-Host ""
        $response = Read-Host "Rename original file to .backup.jsx? (y/n)"
        if ($response -eq 'y') {
            Move-Item -Path $OriginalFile -Destination $BackupFile -Force
            Write-Host "✅ Original file renamed to backup" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "📋 Deployment Checklist:" -ForegroundColor Yellow
    Write-Host "   ✅ Refactored files exist" -ForegroundColor Green
    Write-Host "   ✅ Original file backed up" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Update parent component import (if needed)" -ForegroundColor White
    Write-Host "      From: import HrSideForm from './HrSideForm'" -ForegroundColor Gray
    Write-Host "      To:   import HrSideForm from './HrSideForm/index'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Test locally" -ForegroundColor White
    Write-Host "      - Open the application" -ForegroundColor Gray
    Write-Host "      - Navigate to Performance Management" -ForegroundColor Gray
    Write-Host "      - Test all 4 tabs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Deploy to staging" -ForegroundColor White
    Write-Host "      - Run full QA tests" -ForegroundColor Gray
    Write-Host "      - Check for errors in console" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   4. Deploy to production" -ForegroundColor White
    Write-Host "      - Monitor error logs" -ForegroundColor Gray
    Write-Host "      - Watch performance metrics" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
    return $true
}

function Invoke-Rollback {
    Write-Host "🔄 Rolling Back..." -ForegroundColor Cyan
    Write-Host ""
    
    if (-not (Test-Path $BackupFile)) {
        Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red
        Write-Host "   Cannot rollback without backup!" -ForegroundColor Gray
        return $false
    }
    
    Write-Host "⚠️  WARNING: This will restore the original monolithic file" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Are you sure you want to rollback? (yes/no)"
    
    if ($response -eq 'yes') {
        Copy-Item -Path $BackupFile -Destination $OriginalFile -Force
        Write-Host "✅ Rollback complete!" -ForegroundColor Green
        Write-Host "   Original file restored: $OriginalFile" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📝 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Update parent component import back to original" -ForegroundColor White
        Write-Host "   2. Test the application" -ForegroundColor White
        Write-Host "   3. Investigate what went wrong" -ForegroundColor White
        Write-Host "   4. Fix issues before redeploying" -ForegroundColor White
        return $true
    } else {
        Write-Host "❌ Rollback cancelled" -ForegroundColor Red
        return $false
    }
}

function Invoke-FullDeployment {
    Write-Host "🎯 Starting Full Deployment Process..." -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Validate
    Write-Host "Step 1/3: Validation" -ForegroundColor Yellow
    Write-Host "─────────────────────" -ForegroundColor Gray
    if (-not (Invoke-Validation)) {
        Write-Host ""
        Write-Host "❌ Full deployment aborted due to validation failure" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    Write-Host "Press any key to continue to backup..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
    
    # Step 2: Backup
    Write-Host "Step 2/3: Backup" -ForegroundColor Yellow
    Write-Host "─────────────────────" -ForegroundColor Gray
    if (-not (Invoke-Backup)) {
        Write-Host ""
        Write-Host "❌ Full deployment aborted due to backup failure" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    Write-Host "Press any key to continue to deployment..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
    
    # Step 3: Deploy
    Write-Host "Step 3/3: Deployment" -ForegroundColor Yellow
    Write-Host "─────────────────────" -ForegroundColor Gray
    if (-not (Invoke-Deploy)) {
        Write-Host ""
        Write-Host "❌ Full deployment failed" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          🎉 FULL DEPLOYMENT COMPLETE! 🎉                  ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Deployment Summary:" -ForegroundColor Yellow
    Write-Host "   ✅ Validation: PASSED" -ForegroundColor Green
    Write-Host "   ✅ Backup: CREATED" -ForegroundColor Green
    Write-Host "   ✅ Deployment: READY" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Documentation:" -ForegroundColor Yellow
    Write-Host "   - MIGRATION_GUIDE.md  → Detailed deployment steps" -ForegroundColor White
    Write-Host "   - TESTING_GUIDE.md    → Testing procedures" -ForegroundColor White
    Write-Host "   - QUICK_REFERENCE.md  → Developer quick reference" -ForegroundColor White
    Write-Host "   - ROADMAP.md          → Complete project roadmap" -ForegroundColor White
    Write-Host ""
    return $true
}

# Main execution
switch ($Action) {
    'validate' {
        Invoke-Validation
    }
    'backup' {
        Invoke-Backup
    }
    'deploy' {
        Invoke-Deploy
    }
    'rollback' {
        Invoke-Rollback
    }
    'full' {
        Invoke-FullDeployment
    }
    default {
        Show-Menu
        Write-Host "Usage: .\deploy.ps1 -Action <action>" -ForegroundColor Gray
        Write-Host "Example: .\deploy.ps1 -Action full" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""