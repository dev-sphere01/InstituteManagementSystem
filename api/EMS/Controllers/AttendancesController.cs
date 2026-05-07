using DocumentFormat.OpenXml.Bibliography;
using EMS.Data;
using EMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Logging;
using Microsoft.EntityFrameworkCore;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using EMS.Services;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly AttendanceSyncService _syncService;

        public AttendancesController(EMSDbContext context, AttendanceSyncService syncService)
        {
            _context = context;
            _syncService = syncService;
        }

        // GET: api/Attendances
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAttendances()
        {
            return await _context.Attendances.ToListAsync();
        }

        // GET: api/Attendances/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Attendance>> GetAttendance(int id)
        {
            var attendance = await _context.Attendances.FindAsync(id);

            if (attendance == null)
            {
                return NotFound();
            }

            return attendance;
        }

        // PUT: api/Attendances/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAttendance(int id, Attendance attendance)
        {
            if (id != attendance.AttendaceID)
            {
                return BadRequest();
            }

            _context.Entry(attendance).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttendanceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        
        [HttpPost]
        public async Task<ActionResult> PostAttendance(List<Attendance> attendances)
        {
            try
            {
                foreach (var attendance in attendances)
                {
                    if (attendance == null)
                        return BadRequest("One or more attendance records are null.");

                    if (!attendance.Date.HasValue)
                        continue;
                    
                    {
                        // ---- Time calculation (CORRECT) ----
                        var baseDate = attendance.Date.Value.Date;

                        var checkIn = baseDate.Add(
                            attendance.CheckInTime.Value.ToTimeSpan());

                        var checkOut = baseDate.Add(
                            attendance.CheckOutTime.Value.ToTimeSpan());

                        if (checkOut < checkIn)
                            checkOut = checkOut.AddDays(1);

                        var actualDuration = checkOut - checkIn;
                        attendance.TotalHours = actualDuration;

                        // ---- Fetch employee ----
                        var employee = await _context.Employees
                            .FirstOrDefaultAsync(e =>
                                e.AtdEmpCode == attendance.AtdEmpCode &&
                                e.LocationID == attendance.LocationID);

                        if (employee == null)
                            continue;

                        var empDeptPos = await _context.EmpDeptPositions
                            .FirstOrDefaultAsync(x => x.EmpID == employee.EmpID);

                        attendance.StandardizedHours = await ApplyDailyRules(
                            attendance.LocationID,
                            empDeptPos?.EmpTypeID,
                            actualDuration
                        );
                    }

                    // ---- UPSERT attendance ----
                    var existing = await _context.Attendances.FirstOrDefaultAsync(a =>
                        a.AtdEmpCode == attendance.AtdEmpCode &&
                        a.Date == attendance.Date &&
                        a.LocationID == attendance.LocationID);

                    if (existing != null)
                    {
                        existing.CheckInTime = attendance.CheckInTime;
                        existing.CheckOutTime = attendance.CheckOutTime;
                        existing.TotalHours = attendance.TotalHours;
                        existing.StandardizedHours = attendance.StandardizedHours;
                    }
                    else
                    {
                        _context.Attendances.Add(attendance);
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok("Import Successful");
        }


        [HttpGet("GetEmpAttendancebyIDandMonth")]
        public async Task<ActionResult<object>> GetAttendanceforEmployeeMonth(int empID, int month)
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.EmpID == empID);
            if (emp == null)
            {
                return NotFound($"Employee with ID {empID} not found.");
            }
            var attendance = await _context.Attendances
                .Where(a => a.AtdEmpCode == emp.AtdEmpCode && a.Date.HasValue && a.Date.Value.Month == month)
                .ToListAsync();
            var totalhours = attendance.Sum(a => a.TotalHours?.TotalHours ?? 0);
            var longestlogin = attendance
                .Where(a => a.TotalHours.HasValue)
                .OrderByDescending(a => a.TotalHours.Value)
                .FirstOrDefault();
            return Ok(new { attendance, totalhours, longestlogin });
        }

        // DELETE: api/Attendances/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttendance(int id)
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null)
            {
                return NotFound();
            }

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AttendanceExists(int id)
        {
            return _context.Attendances.Any(e => e.AttendaceID == id);
        }


        [HttpPost("SyncFromMdb")]
        public async Task<IActionResult> SyncFromMdb([FromBody] MdbSyncRequest request)
        {
            try
            {
                int count = await _syncService.SyncAttendanceFromMdb(
                    request.MdbPath, 
                    request.FromDate, 
                    request.ToDate, 
                    request.LocationID);

                return Ok(new { Message = "Synchronization Successful", RecordsSynced = count });
            }
            catch (FileNotFoundException ex)
            {
                return BadRequest(new { Message = "Database file not found", Details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Sync failed", Details = ex.Message });
            }
        }

        public class MdbSyncRequest
        {
            public string? MdbPath { get; set; }
            public DateTime FromDate { get; set; }
            public DateTime ToDate { get; set; }
            public int LocationID { get; set; }
        }

        [HttpPost("ImportAttendance/{locationID}")]
        public async Task<IActionResult> ImportAttendance(IFormFile file, int locationID)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "No file uploaded or file is empty." });

            try
            {
                IWorkbook workbook;
                using (var stream = file.OpenReadStream())
                {
                    var ext = Path.GetExtension(file.FileName);
                    workbook = ext.Equals(".xls", StringComparison.OrdinalIgnoreCase)
                        ? new HSSFWorkbook(stream)
                        : new XSSFWorkbook(stream);
                }

                if (workbook.NumberOfSheets <= 0)
                    return BadRequest(new { Message = "The workbook contains no worksheets." });

                var attendances = new List<Attendance>();
                var empCodes = new HashSet<int>();

                // =======================
                // 1️ READ EXCEL
                // =======================
                for (int sheetIndex = 0; sheetIndex < workbook.NumberOfSheets; sheetIndex++)
                {
                    var sheet = workbook.GetSheetAt(sheetIndex);
                    if (sheet == null) continue;

                    int currentEmpCode = 0;

                    for (int rowIndex = 0; rowIndex <= sheet.LastRowNum; rowIndex++)
                    {
                        var row = sheet.GetRow(rowIndex);
                        if (row == null) continue;

                        // Employee Code row
                        var empCodeCell = row.GetCell(2);
                        if (empCodeCell != null &&
                            int.TryParse(empCodeCell.ToString().Trim(), out int empCode))
                        {
                            currentEmpCode = empCode;
                            empCodes.Add(currentEmpCode);
                            continue;
                        }

                        if (currentEmpCode == 0) continue;

                        var dateValue = TryGetDate(row.GetCell(1));
                        if (!dateValue.HasValue) continue;

                        var checkIn = TryGetTime(row.GetCell(2));
                        var checkOut = TryGetTime(row.GetCell(3));

                        attendances.Add(new Attendance
                        {
                            LocationID = locationID,
                            AtdEmpCode = currentEmpCode,
                            Date = dateValue.Value,
                            CheckInTime = checkIn,
                            CheckOutTime = checkOut
                        });
                    }
                }

                if (!attendances.Any())
                    return Ok(new { Message = "No attendance records found." });

                // =======================
                // 2️ FETCH EMPLOYEES ONCE
                // =======================
                var employees = await _context.Employees
                    .Where(e =>
                        e.AtdEmpCode.HasValue &&
                        empCodes.Contains(e.AtdEmpCode.Value) &&
                        e.LocationID == locationID)
                    .ToListAsync();

                var employeeByCode = employees
                    .ToDictionary(e => e.AtdEmpCode.Value);

                // =======================
                // 3️ FETCH EMP DEPT POS ONCE
                // =======================
                var empIds = employees.Select(e => e.EmpID).ToList();

                var empDeptPositions = await _context.EmpDeptPositions
                    .Where(e => empIds.Contains(e.EmpID))
                    .ToListAsync();

                var empDeptPosByEmpId = empDeptPositions
                    .ToDictionary(e => e.EmpID);

                // =======================
                // 4️ PROCESS ATTENDANCE
                // =======================
                foreach (var attendance in attendances)
                {
                    if (!attendance.Date.HasValue ||
                        !attendance.CheckInTime.HasValue ||
                        !attendance.CheckOutTime.HasValue)
                    {
                        attendance.TotalHours = null;
                        attendance.StandardizedHours = null;
                        continue;
                    }

                    if (!employeeByCode.TryGetValue(attendance.AtdEmpCode.Value, out var employee))
                        continue;

                    if (!empDeptPosByEmpId.TryGetValue(employee.EmpID, out var empDeptPos))
                        continue;

                    // ---- Time calculation ----
                    var baseDate = attendance.Date.Value.Date;

                    var checkInDateTime = baseDate.Add(attendance.CheckInTime.Value.ToTimeSpan());
                    var checkOutDateTime = baseDate.Add(attendance.CheckOutTime.Value.ToTimeSpan());

                    if (checkOutDateTime < checkInDateTime)
                        checkOutDateTime = checkOutDateTime.AddDays(1);

                    var actualDuration = checkOutDateTime - checkInDateTime;

                    attendance.TotalHours = actualDuration;

                    // ---- Apply Daily Rules ----
                    attendance.StandardizedHours = await ApplyDailyRules(
                        attendance.LocationID,
                        empDeptPos.EmpTypeID,
                        actualDuration
                    );
                }

                // =======================
                // 5️ SAVE TO DB
                // =======================
                _context.Attendances.AddRange(attendances);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Import successful",
                    Count = attendances.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to import attendance.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetEmployeesWithAttendance/{year:int}/{month:int}")]
        public async Task<IActionResult> GetEmployeesWithAttendance(int year, int month)
        {
            var attendances = await (
                from a in _context.Attendances
                join e in _context.Employees
                    on new { a.AtdEmpCode, a.LocationID } // 👈 join using both fields
                    equals new { e.AtdEmpCode, e.LocationID }
                where a.Date.HasValue &&
                      a.Date.Value.Year == year &&
                      a.Date.Value.Month == month
                select new
                {
                    a.AttendaceID,
                    a.AtdEmpCode,
                    e.FirstName,
                    e.LastName,
                    a.Date,
                    a.CheckInTime,
                    a.CheckOutTime,
                    a.TotalHours,
                    EmployeeLocationID = e.LocationID // ✅ employee location
                }
            ).ToListAsync().ConfigureAwait(false);

            if (!attendances.Any())
            {
                return NotFound(new { Message = $"No attendance records found for {month}/{year}." });
            }

            var result = attendances
                .GroupBy(a => new { a.AtdEmpCode, a.EmployeeLocationID }) // ✅ grouped correctly
                .Select(g =>
                {
                    long totalTicks = g.Sum(x => x.TotalHours?.Ticks ?? 0);
                    var totalTime = new TimeSpan(totalTicks);

                    return new
                    {
                        g.Key.AtdEmpCode,
                        g.Key.EmployeeLocationID,
                        FirstName = g.First().FirstName,
                        LastName = g.First().LastName,
                        AttendanceRecords = g.Select(x => new
                        {
                            x.AttendaceID,
                            x.Date,
                            x.CheckInTime,
                            x.CheckOutTime,
                            x.TotalHours
                        }).ToList(),
                        TotalHoursWorked = $"{(int)totalTime.TotalHours}:{totalTime.Minutes:D2}:{totalTime.Seconds:D2}"
                    };
                })
                .OrderBy(g => g.AtdEmpCode)
                .ThenBy(g => g.EmployeeLocationID)
                .ToList();

            return Ok(result);
        }

        [HttpPost("LeaveRegularization")]
        public async Task<ActionResult> LeaveRegularization()
        {
            var employees = await _context.Employees.ToListAsync();

            EMS.Services.FileLogger.Log("===== Leave Regularization Started =====");

            foreach (var emp in employees)
            {
                var leaves = await _context.Leaves
                    .Where(l => l.EmpID == emp.EmpID
                                && l.IsApproved == true
                                && l.LeaveType == "On-Duty")
                    .ToListAsync();

                foreach (var leave in leaves)
                {
                    DateTime startDate;
                    DateTime endDate;

                    if (leave.StartDate == null && leave.EndDate != null)
                    {
                        startDate = leave.EndDate.Value.Date;
                        endDate = leave.EndDate.Value.Date;
                    }
                    else if (leave.StartDate != null && leave.EndDate != null)
                    {
                        startDate = leave.StartDate.Value.Date;
                        endDate = leave.EndDate.Value.Date;
                    }
                    else
                    {
                        EMS.Services.FileLogger.Log($"Skipped invalid leave | LeaveID: {leave.LeaveID}");
                        continue;
                    }

                    int totalDays = (endDate - startDate).Days + 1;
                    int totalOnDutyHours = leave.OnDutyHours ?? 0;

                    if (totalDays <= 0 || totalOnDutyHours <= 0)
                    {
                        EMS.Services.FileLogger.Log($"Skipped leave with invalid hours | LeaveID: {leave.LeaveID}");
                        continue;
                    }

                    double hoursPerDay = (double)totalOnDutyHours / totalDays;

                    for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
                    {
                        var existingAttendance = await _context.Attendances
                            .FirstOrDefaultAsync(a =>
                                a.AtdEmpCode == emp.AtdEmpCode &&
                                a.LocationID == emp.LocationID &&
                                a.Date == date);

                        double dailyHours = Math.Min(hoursPerDay, 24);

                        TimeOnly checkOutTime =
                            dailyHours >= 24
                                ? new TimeOnly(23, 59)
                                : TimeOnly.FromTimeSpan(TimeSpan.FromHours(dailyHours));

                        if (existingAttendance == null)
                        {
                            var attendance = new Attendance
                            {
                                AtdEmpCode = emp.AtdEmpCode,
                                LocationID = emp.LocationID,
                                Date = date,
                                CheckInTime = new TimeOnly(0, 0),
                                CheckOutTime = checkOutTime,
                                TotalHours = TimeSpan.FromHours(dailyHours),
                                StandardizedHours = TimeSpan.FromHours(dailyHours)
                            };

                            _context.Attendances.Add(attendance);

                            EMS.Services.FileLogger.Log(
                                $"CREATED | EmpID:{emp.EmpID} | Date:{date:yyyy-MM-dd} | Hours:{dailyHours}"
                            );
                        }
                        else
                        {
                            existingAttendance.CheckInTime = new TimeOnly(0, 0);
                            existingAttendance.CheckOutTime = checkOutTime;
                            existingAttendance.TotalHours = TimeSpan.FromHours(dailyHours);
                            existingAttendance.StandardizedHours = TimeSpan.FromHours(dailyHours);

                            _context.Attendances.Update(existingAttendance);

                            EMS.Services.FileLogger.Log(
                                $"UPDATED | EmpID:{emp.EmpID} | Date:{date:yyyy-MM-dd} | Hours:{dailyHours}"
                            );
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            EMS.Services.FileLogger.Log("===== Leave Regularization Completed =====");

            return Ok("Leave regularization completed successfully.");
        }


        [HttpPost("StoreTotalAttendanceHours")]
        public async Task<IActionResult> StoreTotalAttendanceHours(int Year, int Month)
        {
            // Get all employees
            var employees = await _context.Employees.ToListAsync();

            foreach (var emp in employees)
            {
                // Fetch attendance records for this employee in the given year and month
                var attendanceRecords = await _context.Attendances
                    .Where(a => a.AtdEmpCode == emp.AtdEmpCode &&
                                a.Date.HasValue &&
                                a.Date.Value.Year == Year &&
                                a.Date.Value.Month == Month
                                && a.LocationID == emp.LocationID)
                    .ToListAsync();

                if (attendanceRecords.Count > 0)
                {
                    // Sum up total hours for the employee
                    var sumActual = (decimal)attendanceRecords
        .Where(a => a.TotalHours.HasValue)
        .Sum(a => a.TotalHours.Value.TotalHours);
                    sumActual = Math.Round(sumActual,0);

                    // 2. Sum daily standardized hours
                    var sumDailyStandardized = (decimal)attendanceRecords
                        .Where(a => a.StandardizedHours.HasValue)
                        .Sum(a => a.StandardizedHours.Value.TotalHours);

                    var finalPayrollHours = await ApplyMonthlyRounding(sumDailyStandardized);
                    finalPayrollHours = Math.Round(finalPayrollHours,0);

                    // Create a new AttendanceTotalHours entry
                    var totalRecord = new AttendanceTotalHours
                    {
                        EmpID = emp.EmpID,
                        Year = Year,
                        Month = Month,
                        ActualTotalHours = sumActual,
                        StandardizedTotalHours = finalPayrollHours
                    };

                    // Check if record already exists -> Update, else Insert
                    var existingRecord = await _context.AttendanceTotalHours
                        .FirstOrDefaultAsync(x => x.EmpID == emp.EmpID && x.Year == Year && x.Month == Month);

                    if (existingRecord != null)
                    {
                        existingRecord.ActualTotalHours = totalRecord.ActualTotalHours;
                        existingRecord.StandardizedTotalHours = totalRecord.StandardizedTotalHours;
                        _context.AttendanceTotalHours.Update(existingRecord);
                    }
                    else
                    {
                        await _context.AttendanceTotalHours.AddAsync(totalRecord);
                    }
                }
            }




            await _context.SaveChangesAsync();

            return Ok("Total attendance hours stored successfully.");
        }

        [HttpPost("ImportTotalHours")]
        public async Task<IActionResult> ImportTotalHours(List<AttendanceTotalHours> totalHoursList)
        {
            if (totalHoursList == null || totalHoursList.Count == 0)
            {
                return BadRequest("No data provided for import.");
            }

            foreach (var totalHours in totalHoursList)
            {
                if (totalHours == null)
                {
                    return BadRequest("One or more records are null.");
                }

                // Check if record already exists -> Update, else Insert
                var existingRecord = await _context.AttendanceTotalHours
                    .FirstOrDefaultAsync(x => x.EmpID == totalHours.EmpID && x.Year == totalHours.Year && x.Month == totalHours.Month);

                if (existingRecord != null)
                {
                    existingRecord.ActualTotalHours = totalHours.ActualTotalHours;
                    existingRecord.StandardizedTotalHours = totalHours.StandardizedTotalHours;
                    _context.AttendanceTotalHours.Update(existingRecord);
                }
                else
                {
                    await _context.AttendanceTotalHours.AddAsync(totalHours);
                }
            }

            await _context.SaveChangesAsync();

            return Ok("Import successful.");
        }

        [HttpGet("GetHoursbyEmployees")]
        public async Task<IActionResult> GetTotalHoursByEmployees(int Year, int Month)
        {
            var totalHoursList = await _context.AttendanceTotalHours
                .Where(ath => ath.Year == Year && ath.Month == Month)
                .GroupJoin(
                    _context.Employees,
                    ath => ath.EmpID,
                    emp => emp.EmpID,
                    (ath, empGroup) => new { ath, empGroup }
                )
                .SelectMany(
                    x => x.empGroup.DefaultIfEmpty(), // Left join
                    (x, emp) => new
                    {
                        x.ath.AthID,
                        EmpID = x.ath.EmpID,
                        FirstName = emp != null ? emp.FirstName : null,
                        LastName = emp != null ? emp.LastName : null,
                        x.ath.Year,
                        x.ath.Month,
                        x.ath.StandardizedTotalHours
                    }
                )
                .ToListAsync();

            if (totalHoursList.Count == 0)
            {
                return NotFound("No records found for the specified month and year.");
            }

            return Ok(totalHoursList);
        }


        [HttpPut("UpdateAttendanceTotalHours")]
        public async Task<IActionResult> UpdateAttendanceHours(UpdateRequest updaterequest)
        {
            var record = await _context.AttendanceTotalHours.FirstOrDefaultAsync(x => x.EmpID == updaterequest.EmpID && x.Year == updaterequest.Year && x.Month == updaterequest.Month);
            if (record == null)
            {
                return NotFound("Record not found.");
            }
            record.StandardizedTotalHours = updaterequest.NewTotalHours;
            _context.AttendanceTotalHours.Update(record);
            await _context.SaveChangesAsync();
            return Ok("Total hours updated successfully.");
        }

        // Helper method for date extraction
        private DateTime? TryGetDate(ICell cell)
        {
            if (cell == null) return null;
            if (cell.CellType == CellType.Numeric && DateUtil.IsCellDateFormatted(cell))
                return cell.DateCellValue;
            if (DateTime.TryParse(cell.ToString(), out DateTime parsedDate))
                return parsedDate;
            return null;
        }

        // Helper method for time extraction
        private TimeOnly? TryGetTime(ICell cell)
        {
            if (cell == null) return null;

            if (cell.CellType == CellType.Numeric && DateUtil.IsCellDateFormatted(cell))
            {
                var dateTimeValue = cell.DateCellValue; // This is DateTime?
                if (dateTimeValue.HasValue)
                    return TimeOnly.FromDateTime(dateTimeValue.Value);
                else
                    return null;
            }

            if (DateTime.TryParse(cell.ToString(), out DateTime parsed))
                return TimeOnly.FromDateTime(parsed);

            return null;
        }

        private async Task<TimeSpan?> ApplyDailyRules(
    int? locationId,
    int? empType,
    TimeSpan? actualDuration)
        {

            if (actualDuration == null || locationId == null)
                return actualDuration;

            var rule = await _context.AttendanceDailyRules
                .Where(r =>
                    r.LocationID == locationId &&
                    (r.EmpType == null || r.EmpType == empType) &&
                    actualDuration >= r.MinHours &&
                    (r.MaxHours == null || actualDuration < r.MaxHours))
                .OrderByDescending(r => r.MinHours)
                .FirstOrDefaultAsync();


            return rule?.RewardedHours ?? actualDuration;
        }


        private async Task<decimal> ApplyMonthlyRounding(decimal totalHours)
        {
            var rule = await _context.AttendanceMonthlyRules
                .Where(r => totalHours >= r.ThresholdMin && totalHours <= r.ThresholdMax)
                .OrderByDescending(r => r.ThresholdMin) // Prioritize more specific/higher thresholds
                .FirstOrDefaultAsync();

            return rule != null ? rule.TargetHours : totalHours;
        }

        public class UpdateRequest
        {
            public int EmpID { get; set; }
            public int Year { get; set; }
            public int Month { get; set; }
            public decimal NewTotalHours { get; set; }
        }

    }
}
