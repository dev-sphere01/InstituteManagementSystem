using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Linq;
using System.Threading.Tasks;
using EMS.Data;
using EMS.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Configuration;
using System.IO;

namespace EMS.Services
{
    public class AttendanceSyncService
    {
        private readonly EMSDbContext _context;
        private readonly IConfiguration _configuration;

        public AttendanceSyncService(EMSDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<int> SyncAttendanceFromMdb(string? mdbPath, DateTime fromDate, DateTime toDate, int locationID)
        {
            // Use provided path or fallback to appsettings
            string finalPath = mdbPath;
            if (string.IsNullOrEmpty(finalPath))
            {
                finalPath = _configuration["AttendanceSettings:MdbPath"] ?? "C:\\Attendance.mdb";
            }

            if (!File.Exists(finalPath))
            {
                throw new FileNotFoundException($"Attendance database file not found at: {finalPath}");
            }

            string provider = _configuration["AttendanceSettings:OLEDBProvider"] ?? "Microsoft.ACE.OLEDB.12.0";
            string connectionString = $"Provider={provider};Data Source={finalPath};";
            // If it's an .accdb file or newer, it might need:
            // "Provider=Microsoft.ACE.OLEDB.12.0;Data Source={mdbPath};"

            // However, the user explicitly said .mdb

            var attendanceRecords = new List<Attendance>();
            int recordsSynced = 0;

            using (OleDbConnection connection = new OleDbConnection(connectionString))
            {
                try
                {
                    connection.Open();

                    // Query to join Employees and AttendanceLogs in the MDB
                    // We need: EmployeeId, EmployeeCode, EMSEMPID, AttendanceDate, InTime, OutTime
                    string query = @"
                        SELECT 
                            e.EmployeeId, 
                            e.EmployeeCode, 
                            e.EMSEMPID, 
                            a.AttendanceDate, 
                            a.InTime, 
                            a.OutTime
                        FROM Employees e
                        INNER JOIN AttendanceLogs a ON e.EmployeeId = a.EmployeeId
                        WHERE a.AttendanceDate >= ? AND a.AttendanceDate <= ?
                    ";

                    Console.WriteLine($"Executing Query: {query} with dates {fromDate.Date} to {toDate.Date}");

                    using (OleDbCommand command = new OleDbCommand(query, connection))
                    {
                        // Use positional parameters with OleDbType.Date for broadest compatibility
                        command.Parameters.Add("?", OleDbType.Date).Value = fromDate.Date;
                        command.Parameters.Add("?", OleDbType.Date).Value = toDate.Date.AddDays(1).AddSeconds(-1);

                        using (OleDbDataReader reader = command.ExecuteReader())
                        {
                            int totalRowsRead = 0;
                            while (reader.Read())
                            {
                                totalRowsRead++;
                                
                                // Fetch EMSEMPID and handle potential types (Access might return it as Int or String)
                                var mdbEmpIdValue = reader["EMSEMPID"];
                                
                                if (mdbEmpIdValue == null || mdbEmpIdValue == DBNull.Value || string.IsNullOrWhiteSpace(mdbEmpIdValue.ToString()))
                                {
                                    continue;
                                }

                                string emsEmpIdStr = mdbEmpIdValue.ToString().Trim();
                                if (string.IsNullOrEmpty(emsEmpIdStr)) continue;
                                
                                int emsEmpId;
                                if (!int.TryParse(emsEmpIdStr, out emsEmpId)) 
                                {
                                    Console.WriteLine($"Failed to parse EMSEMPID: {emsEmpIdStr}");
                                    continue;
                                }

                                DateTime? attendanceDate = reader["AttendanceDate"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(reader["AttendanceDate"]) : null;
                                if (!attendanceDate.HasValue) continue;

                                DateTime? inTimeRaw = reader["InTime"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(reader["InTime"]) : null;
                                DateTime? outTimeRaw = reader["OutTime"] != DBNull.Value ? (DateTime?)Convert.ToDateTime(reader["OutTime"]) : null;

                                TimeOnly? inTime = inTimeRaw.HasValue ? TimeOnly.FromDateTime(inTimeRaw.Value) : null;
                                TimeOnly? outTime = outTimeRaw.HasValue ? TimeOnly.FromDateTime(outTimeRaw.Value) : null;

                                // We store the EMSEMPID (EMS EmpID) into att.EmpID for later processing
                                attendanceRecords.Add(new Attendance
                                {
                                    LocationID = locationID,
                                    Date = attendanceDate,
                                    CheckInTime = inTime,
                                    CheckOutTime = outTime,
                                    EmpID = emsEmpId 
                                });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception($"Error reading from Access DB: {ex.Message}", ex);
                }
            }

            if (attendanceRecords.Any())
            {
                // Process and save to DB
                recordsSynced = await ProcessAndSaveAttendances(attendanceRecords, locationID);
            }

            return recordsSynced;
        }

        private async Task<int> ProcessAndSaveAttendances(List<Attendance> mdbAttendances, int locationID)
        {
            var emsEmpIds = mdbAttendances.Select(a => a.EmpID.Value).Distinct().ToList();

            // Fetch employees from EMS to get their actual AtdEmpCode and ensure they exist
            var employees = await _context.Employees
                .Where(e => emsEmpIds.Contains(e.EmpID))
                .ToListAsync();

            var employeeMap = employees.ToDictionary(e => e.EmpID);
            
            // Also need EmpDeptPositions for daily rules
            var empIds = employees.Select(e => e.EmpID).ToList();
            var empDeptPositions = await _context.EmpDeptPositions
                .Where(edp => empIds.Contains(edp.EmpID))
                .ToListAsync();
            var empDeptPosMap = empDeptPositions.ToDictionary(edp => edp.EmpID);

            int savedCount = 0;

            foreach (var att in mdbAttendances)
            {
                if (!employeeMap.TryGetValue(att.EmpID.Value, out var employee))
                    continue;

                // Set the AtdEmpCode from the Employee record
                att.AtdEmpCode = employee.AtdEmpCode;
                att.LocationID = employee.LocationID ?? locationID;

                if (att.Date.HasValue && att.CheckInTime.HasValue && att.CheckOutTime.HasValue)
                {
                    // Calculate TotalHours
                    var baseDate = att.Date.Value.Date;
                    var checkInDateTime = baseDate.Add(att.CheckInTime.Value.ToTimeSpan());
                    var checkOutDateTime = baseDate.Add(att.CheckOutTime.Value.ToTimeSpan());

                    if (checkOutDateTime < checkInDateTime)
                        checkOutDateTime = checkOutDateTime.AddDays(1);

                    att.TotalHours = checkOutDateTime - checkInDateTime;

                    // Apply Daily Rules if possible
                    if (empDeptPosMap.TryGetValue(employee.EmpID, out var edp))
                    {
                        att.StandardizedHours = await ApplyDailyRules(
                            att.LocationID,
                            edp?.EmpTypeID,
                            att.TotalHours
                        );
                    }
                }

                // UPSERT logic
                var existing = await _context.Attendances.FirstOrDefaultAsync(a =>
                    a.EmpID == att.EmpID &&
                    a.Date == att.Date &&
                    a.LocationID == att.LocationID);

                if (existing != null)
                {
                    existing.CheckInTime = att.CheckInTime;
                    existing.CheckOutTime = att.CheckOutTime;
                    existing.TotalHours = att.TotalHours;
                    existing.StandardizedHours = att.StandardizedHours;
                    existing.AtdEmpCode = att.AtdEmpCode;
                }
                else
                {
                    _context.Attendances.Add(att);
                }
                
                savedCount++;
            }

            await _context.SaveChangesAsync();
            return savedCount;
        }

        public async Task<TimeSpan?> ApplyDailyRules(
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
    }
}
