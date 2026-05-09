using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using EMS.Models.NonDBModels;
using EMS.Services;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.RegularExpressions;
using ClosedXML.Excel;
using System.Text.Json;
using System.Dynamic;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly EMSDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUserActivityLogger _logger;

        public EmployeesController(EMSDbContext context, IConfiguration configuration, IUserActivityLogger logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        // GET: api/Employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees.ToListAsync();
        }

        [HttpGet("ForHR/{id:int}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesforHR(int id)
        {
            // 1️⃣ Fetch the HR user's record first
            var hrUser = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmpID == id);

            if (hrUser == null)
                return NotFound("HR employee not found.");

            // 2️⃣ Fetch all employees excluding:
            //    - The HR user themselves
            //    - The employees they report to
            var employees = await _context.Employees
                .AsNoTracking()
                .Where(e =>
                    e.EmpID != id && e.EmpID != 1 &&
                    (hrUser.ReportsTo == null || !hrUser.ReportsTo.Contains(e.EmpID))
                    && e.IsActive == true
                )
                .ToListAsync();

            return Ok(employees);
        }


        // GET: api/Employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            return employee;
        }

        [HttpGet("GetReportingManagers/{id}")]
        public async Task<ActionResult<List<String>>> GetReportingManagers(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound("Employee not found.");
            if (employee.ReportsTo == null || !employee.ReportsTo.Any())
                return Ok(new List<Employee>()); // No managers
            var managers = await _context.Employees
                .Where(e => employee.ReportsTo.Contains(e.EmpID)).Select(e => new { e.EmpID, e.FirstName, e.LastName })
                .ToListAsync();
            return Ok(managers);
        }

        [HttpGet("ManagerSelection/{id}")]
        public async Task<ActionResult<List<object>>> GetManagerSelection(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound("Employee not found.");

            // Employee dept & position
            var empDeptPos = await (
                from edp in _context.EmpDeptPositions
                join d in _context.Departments on edp.DeptID equals d.DeptID
                join p in _context.Positions on edp.PositionID equals p.PositionID
                where edp.EmpID == id
                select new
                {
                    edp.DeptID,
                    DeptName = d.DeptName,
                    PositionName = p.PositionName
                }
            ).FirstOrDefaultAsync();

            if (empDeptPos == null)
                return BadRequest("Employee department or position not found.");

            var isManagementEmployee = empDeptPos.DeptName == "Management";

            var managers = await (
                from e in _context.Employees
                join edp in _context.EmpDeptPositions on e.EmpID equals edp.EmpID
                join d in _context.Departments on edp.DeptID equals d.DeptID
                join p in _context.Positions on edp.PositionID equals p.PositionID
                where
                    e.EmpID != id &&
                    e.EmpID != 1 &&
                    e.IsActive
                    &&
                    (
                        // CASE 1: Employee is from Management → return all
                        isManagementEmployee

                        // CASE 2: Employee is from other dept
                        || (
                            d.DeptName == "Management"
                            || (
                                edp.DeptID == empDeptPos.DeptID
                                && (
                                    p.PositionName.Contains("Manager")
                                    || p.PositionName.Contains("HOD")
                                    || p.PositionName.Contains("Supervisor")
                                )
                                && p.PositionName != empDeptPos.PositionName
                            )
                        )
                    )
                select new
                {
                    e.EmpID,
                    e.FirstName,
                    e.LastName,
                    Department = d.DeptName,
                    Position = p.PositionName
                }
            ).OrderBy(e=>e.FirstName).ToListAsync();

            return Ok(managers);
        }



        [HttpPost("UpdateReportsTo")]
        public async Task<IActionResult> UpdateReportsTo(IFormFile formFile)
        {
            if (formFile == null || formFile.Length == 0)
                return BadRequest("Please upload a valid Excel file.");

            var employeesToUpdate = new List<Employee>();

            using (var stream = new MemoryStream())
            {
                await formFile.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1); // First sheet
                    var rows = worksheet.RangeUsed().RowsUsed();

                    foreach (var row in rows.Skip(1)) // skip header
                    {
                        int empId;
                        string? reportMgrStr = row.Cell(2).GetString();

                        if (!int.TryParse(row.Cell(1).GetString(), out empId))
                            continue; // Skip invalid EmpID rows

                        // Clean and parse the ReportsTo string like "[365,352]"
                        List<int>? reportsToList = null;

                        if (!string.IsNullOrEmpty(reportMgrStr))
                        {
                            try
                            {
                                // handle both JSON-like "[365,352]" or comma-separated "365,352"
                                if (reportMgrStr.StartsWith("["))
                                    reportsToList = JsonSerializer.Deserialize<List<int>>(reportMgrStr);
                                else
                                    reportsToList = reportMgrStr
                                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                        .Select(x => int.Parse(x.Trim()))
                                        .ToList();
                            }
                            catch
                            {
                                reportsToList = null;
                            }
                        }

                        if (reportsToList != null)
                        {
                            employeesToUpdate.Add(new Employee
                            {
                                EmpID = empId,
                                ReportsTo = reportsToList
                            });
                        }
                    }
                }
            }

            if (employeesToUpdate.Count == 0)
                return BadRequest("No valid employee data found in the file.");

            // Update in DB
            foreach (var empData in employeesToUpdate)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmpID == empData.EmpID);
                if (employee != null)
                {
                    employee.ReportsTo = empData.ReportsTo;
                    _context.Employees.Update(employee);
                }
            }

            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Bulk Update ReportsTo",
                $"Updated reporting managers for {employeesToUpdate.Count} employees via Excel import",
                "all"
            );

            return Ok($"{employeesToUpdate.Count} employees updated successfully.");
        }

        [HttpPost("Search")]
        public async Task<ActionResult<PaginatedResponse<Employee>>> GetEmployeesWithSearch([FromBody] EmployeeSearchRequest request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;

            var queryable = _context.Employees.Where(e => e.EmpID != 1).AsQueryable();

            // 🔍 Global search
            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                var term = request.Query.ToLower();
                queryable = queryable.Where(e =>
                    (e.FirstName != null && e.FirstName.ToLower().Contains(term)) ||
                    (e.LastName != null && e.LastName.ToLower().Contains(term)) ||
                    (e.PersonalEmail != null && e.PersonalEmail.ToLower().Contains(term)) ||
                    (e.WorkEmail != null && e.WorkEmail.ToLower().Contains(term)) ||
                    (e.PhoneNumber != null && e.PhoneNumber.ToLower().Contains(term)) ||
                    (e.Address != null && e.Address.ToLower().Contains(term)) ||
                    (e.EmergencyContact != null && e.EmergencyContact.ToLower().Contains(term)) ||
                    (e.EmergencyContactNumber != null && e.EmergencyContactNumber.ToLower().Contains(term)) ||
                    (e.Gender != null && e.Gender.ToLower().Contains(term))
                );
            }

            // 🎯 Column-specific filters
            if (!string.IsNullOrWhiteSpace(request.FirstName))
                queryable = queryable.Where(e => e.FirstName != null && e.FirstName.ToLower().Contains(request.FirstName.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.LastName))
                queryable = queryable.Where(e => e.LastName != null && e.LastName.ToLower().Contains(request.LastName.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.PersonalEmail))
                queryable = queryable.Where(e => e.PersonalEmail != null && e.PersonalEmail.ToLower().Contains(request.PersonalEmail.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.WorkEmail))
                queryable = queryable.Where(e => e.WorkEmail != null && e.WorkEmail.ToLower().Contains(request.WorkEmail.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
                queryable = queryable.Where(e => e.PhoneNumber != null && e.PhoneNumber.ToLower().Contains(request.PhoneNumber.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.Address))
                queryable = queryable.Where(e => e.Address != null && e.Address.ToLower().Contains(request.Address.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.EmergencyContact))
                queryable = queryable.Where(e => e.EmergencyContact != null && e.EmergencyContact.ToLower().Contains(request.EmergencyContact.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.EmergencyContactNumber))
                queryable = queryable.Where(e => e.EmergencyContactNumber != null && e.EmergencyContactNumber.ToLower().Contains(request.EmergencyContactNumber.ToLower()));

            if (!string.IsNullOrWhiteSpace(request.Gender))
                queryable = queryable.Where(e => e.Gender != null && e.Gender.ToLower().Contains(request.Gender.ToLower()));

            if (request.OBStatus != null)
                queryable = queryable.Where(e => e.OBStatus == request.OBStatus);

            if (request.isActive != null)
                queryable = queryable.Where(e => e.IsActive == request.isActive);

            // 📄 Pagination
            int totalCount = await queryable.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            if (!string.IsNullOrWhiteSpace(request.SortField))
            {
                bool ascending = request.SortOrder.ToLower() == "asc";
                queryable = ApplySorting(queryable, request.SortField, ascending);
            }
            else
            {
                // Default sorting if no field is specified
                queryable = queryable.OrderBy(e => e.EmpID);
            }

            var employees = await queryable
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var response = new PaginatedResponse<Employee>
            {
                Data = employees,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = totalPages
            };

            return Ok(response);
        }


        // PUT: api/Employees/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmployee(int id, Employee employee)
        {
            if (id != employee.EmpID)
            {
                return BadRequest();
            }

            var oldEmployee = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmpID == id);
            if (oldEmployee == null) return NotFound();

            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                
                await _logger.LogActivityAsync(
                    "Employee Profile",
                    "Update Employee",
                    $"Updated data for employee {employee.FirstName} {employee.LastName}",
                    id.ToString(),
                    JsonSerializer.Serialize(oldEmployee),
                    JsonSerializer.Serialize(employee)
                );
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id))
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

        [HttpPost("ToggleStatus/{EmpID}")]
        public async Task<IActionResult> ToggleStatus(int EmpID)
        {
            var employee = await _context.Employees.FindAsync(EmpID);
            if (employee == null)
            {
                return NotFound();
            }
            employee.IsActive = !employee.IsActive;
            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Toggle Status",
                $"Changed status for employee {employee.FirstName} {employee.LastName} to {(employee.IsActive ? "Active" : "Inactive")}",
                EmpID.ToString(),
                $"IsActive: {!employee.IsActive}",
                $"IsActive: {employee.IsActive}"
            );

            return Ok(new { employee.EmpID, employee.IsActive });
        }

        [HttpGet("GetEmployeebymanager")]
        public async Task<ActionResult<List<Employee>>> GetEmployeebymanager(int EmpID)
        {
            var employees = _context.Employees
    .AsEnumerable() // loads all employees into memory
    .Where(e => e.ReportsTo != null && e.ReportsTo.Contains(EmpID) && e.EmpID != EmpID && e.IsActive == true)
    .ToList(); // synchronous

            if (!employees.Any())
                return NotFound("No employees found reporting to the specified manager.");

            return Ok(employees);
        }

        // POST: api/Employees
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

        [HttpPost("Import")]
        public async Task<ActionResult<Employee>> PostEmployeeImport(List<EmployeeDTO> employees)
        {
            try
            {
                foreach (var employee in employees)
                {
                    if (employee == null)
                    {
                        return BadRequest("One or more employee data is null.");
                    }
                    if (employee == null)
                    {
                        return BadRequest("Employee data is null.");
                    }
                    Employee employee1 = new Employee()
                    {
                        FirstName = employee.FirstName,
                        LastName = employee.LastName,
                        PersonalEmail = employee.PersonalEmail,
                        WorkEmail = employee.WorkEmail,
                        PhoneNumber = employee.PhoneNumber,
                        Address = employee.Address,
                        EmergencyContact = employee.EmergencyContact,
                        EmergencyContactNumber = employee.EmergencyContactNumber,
                        DateOfBirth = employee.DateOfBirth,
                        Gender = employee.Gender,
                        DateOfJoining = employee.DateOfJoining,
                        OBStatus = employee.OBStatus,
                        IsActive = employee.IsActive,
                        ProfilePicture = employee.ProfilePicture,
                        RoleID = employee.RoleID,
                        LocationID = employee.LocationID,
                        AtdEmpCode = employee.AtdEmpCode
                    };
                    _context.Employees.Add(employee1);
                    await _context.SaveChangesAsync();

                    if (employee.EmpTypeID == null)
                    {
                        employee.EmpTypeID = 1; // Default to Full-Time if not specified
                    }

                    EmpDeptPos empDeptPos = new EmpDeptPos()
                    {
                        EmpID = employee1.EmpID,
                        DeptID = employee.DeptID,
                        PositionID = employee.PositionID,
                        EmpTypeID = employee.EmpTypeID
                    };
                    _context.EmpDeptPositions.Add(empDeptPos);
                    await _context.SaveChangesAsync();

                    string DeptName = _context.Departments
                        .Where(d => d.DeptID == employee.DeptID)
                        .Select(d => d.DeptName)
                        .FirstOrDefault();

                    if (DeptName != null)
                    {
                        DeptName = DeptName.Substring(0, Math.Min(3, DeptName.Length)).ToUpper();
                    }
                    else
                    {
                        DeptName = string.Empty; // Handle case where DeptName is null
                    }
                    string Username = DeptName
    + employee.FirstName.Substring(0, Math.Min(3, employee.FirstName.Length)).ToUpper()
    + employee1.EmpID.ToString("D4");
                    string Password = PasswordGenerate.GeneratePassword();

                    EmpCred empCred = new EmpCred()
                    {
                        EmpID = employee1.EmpID,
                        UserName = Username,
                        Password = Password
                    };
                    _context.EmpCreds.Add(empCred);
                    await _context.SaveChangesAsync();

                    /*if ((!string.IsNullOrEmpty(employee.WorkEmail) || !string.IsNullOrEmpty(employee.PersonalEmail)) && !string.IsNullOrEmpty(Username) && !string.IsNullOrEmpty(Password))
                    {
                        if (!string.IsNullOrEmpty(employee.WorkEmail))
                        {
                            EmailService emailService = new EmailService(_context, _configuration);
                            string subject = "Welcome to the EMS";
                            string result = emailService.SendLoginCredentialEmail(employee.WorkEmail, subject, Username, Password);
                        }
                        else
                        {
                            EmailService emailService = new EmailService(_context, _configuration);
                            string subject = "Welcome to the EMS";
                            string result = emailService.SendLoginCredentialEmail(employee.PersonalEmail, subject, Username, Password);
                        }
                    }
                    else
                    {
                        return BadRequest("Email, Username or Password is missing for one or more employees.");
                    }*/

                }
            }
            catch (Exception ex)
            {
                return BadRequest("An error occurred while processing the request: " + ex.Message);
            }


            // Return the created employee directly with 201 status
            return Ok("Import Completed");
        }

        [HttpGet("GetEmptyFieldsByEmpID/{EmpID}")]
        public async Task<ActionResult<object>> GetEmptyFieldsbyEmpID(int EmpID)
        {
            var result = new Dictionary<string, object>();

            // Helper to get empty fields for an entity
            List<string> GetEmptyFields<T>(T record)
            {
                var emptyFields = new List<string>();
                foreach (var prop in typeof(T).GetProperties())
                {
                    var value = record != null ? prop.GetValue(record) : null;
                    if (value == null || (value is string str && string.IsNullOrWhiteSpace(str)))
                    {
                        var regex = new System.Text.RegularExpressions.Regex(@"ID$", RegexOptions.IgnoreCase);
                        if (regex.IsMatch(prop.Name))
                            continue; // skip properties ending with "ID"
                        emptyFields.Add(prop.Name);
                    }
                }
                return emptyFields;
            }

            // Employee Table
            var employee = await _context.Employees.FindAsync(EmpID);
            result["Employee"] = GetEmptyFields(employee);

            // Bank Details
            var bankDetails = await _context.EmpBankDetails.FirstOrDefaultAsync(b => b.EmpID == EmpID);
            result["EmpBankDetails"] = GetEmptyFields(bankDetails);

            // Academic Table
            var academics = await _context.EmpAcadDetails.Where(a => a.EmpID == EmpID).ToListAsync();
            if (academics.Any())
            {
                result["Academics"] = academics
                    .Select(a => new { AcademicId = a.EadID, Fields = GetEmptyFields(a) })
                    .Where(a => a.Fields.Any())
                    .ToList();
            }
            else
            {
                result["Academics"] = GetEmptyFields<EmpAcadDetail>(null);
            }

            // Professional History
            var histories = await _context.EmpProfDetails.Where(h => h.EmpID == EmpID).ToListAsync();
            if (histories.Any())
            {
                result["ProfessionalHistory"] = histories
                    .Select(h => new { HistoryId = h.EpdID, Fields = GetEmptyFields(h) })
                    .Where(h => h.Fields.Any())
                    .ToList();
            }
            else
            {
                result["ProfessionalHistory"] = GetEmptyFields<EmpProfDetail>(null);
            }

            // ---- DOCUMENTS SECTION WITH MASTER LIST ----
            var masterDocs = await _context.Docs.ToListAsync(); // master list of required docs
            var empDocs = await _context.EmpDocs.Where(d => d.EmpId == EmpID).ToListAsync();
            var docEmptyList = new List<object>();

            foreach (var masterDoc in masterDocs)
            {
                var empDoc = empDocs.FirstOrDefault(e => e.DocName == masterDoc.DocName);

                // Prepare the list of empty fields
                var emptyFields = new List<string>();

                if (empDoc == null)
                {
                    // No document uploaded, mark all fields as empty
                    foreach (var prop in typeof(EmpDoc).GetProperties())
                    {
                        // Apply the special rule for DocIDNumber
                        if (prop.Name == "DocIDNumber" && !masterDoc.isDocIDNumRequired)
                            continue;

                        emptyFields.Add(prop.Name);
                    }

                    docEmptyList.Add(new
                    {
                        DocumentName = masterDoc.DocName,
                        Status = "Missing",
                        Fields = emptyFields
                    });
                }
                else
                {
                    // Document exists, check for empty fields
                    foreach (var prop in typeof(EmpDoc).GetProperties())
                    {
                        var value = prop.GetValue(empDoc);

                        // Apply the special rule for DocIDNumber
                        if (prop.Name == "DocIDNumber" && !masterDoc.isDocIDNumRequired)
                            continue;

                        if (value == null || (value is string str && string.IsNullOrWhiteSpace(str)))
                        {
                            emptyFields.Add(prop.Name);
                        }
                    }

                    if (emptyFields.Any())
                    {
                        docEmptyList.Add(new
                        {
                            DocumentName = empDoc.DocName,
                            Status = "Incomplete",
                            Fields = emptyFields
                        });
                    }
                    else
                    {
                        // Optional: mark it as complete
                        docEmptyList.Add(new
                        {
                            DocumentName = empDoc.DocName,
                            Status = "Complete",
                            Fields = new List<string>()
                        });
                    }
                }
            }

            result["Documents"] = new
            {
                TotalRequired = masterDocs.Count,
                TotalSubmitted = empDocs.Count,
                MissingCount = masterDocs.Count - empDocs.Count,
                Details = docEmptyList
            };

            return Ok(result);
        }





        [HttpPost]
        public async Task<ActionResult<Employee>> PostEmployee(EmployeeDTO employee)
        {
            if (employee == null)
            {
                return BadRequest("Employee data is null.");
            }
            Employee employee1 = new Employee()
            {
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                PersonalEmail = employee.PersonalEmail,
                WorkEmail = employee.WorkEmail,
                PhoneNumber = employee.PhoneNumber,
                Address = employee.Address,
                EmergencyContact = employee.EmergencyContact,
                EmergencyContactNumber = employee.EmergencyContactNumber,
                DateOfBirth = employee.DateOfBirth,
                Gender = employee.Gender,
                DateOfJoining = employee.DateOfJoining,
                OBStatus = employee.OBStatus,
                IsActive = employee.IsActive,
                ProfilePicture = employee.ProfilePicture,
                RoleID = employee.RoleID,
                LocationID = employee.LocationID
            };
            _context.Employees.Add(employee1);
            await _context.SaveChangesAsync();

            await _logger.LogActivityAsync(
                "Employee Profile",
                "Create Employee",
                $"Created employee {employee1.FirstName} {employee1.LastName}",
                employee1.EmpID.ToString(),
                null,
                JsonSerializer.Serialize(employee1)
            );

            if (employee.EmpTypeID == null)
            {
                employee.EmpTypeID = 1; // Default to Full-Time if not specified
            }

            EmpDeptPos empDeptPos = new EmpDeptPos()
            {
                EmpID = employee1.EmpID,
                DeptID = employee.DeptID,
                PositionID = employee.PositionID,
                EmpTypeID = employee.EmpTypeID
            };
            _context.EmpDeptPositions.Add(empDeptPos);
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Employee Department and Position",
                "Department and Position Assigned",
                $"Department and Position Assigned for {employee1.EmpID}",
                employee1.EmpID.ToString(),
                null,
                JsonSerializer.Serialize(empDeptPos)
            );

            string DeptName = _context.Departments
                .Where(d => d.DeptID == employee.DeptID)
                .Select(d => d.DeptName)
                .FirstOrDefault();

            if (DeptName != null)
            {
                DeptName = DeptName.Substring(0, Math.Min(3, DeptName.Length)).ToUpper();
            }
            else
            {
                DeptName = string.Empty; // Handle case where DeptName is null
            }
            string Username = DeptName + employee.FirstName.Substring(0, 4).ToUpper() + employee1.EmpID.ToString();
            string Password = PasswordGenerate.GeneratePassword();

            EmpCred empCred = new EmpCred()
            {
                EmpID = employee1.EmpID,
                UserName = Username,
                Password = Password
            };
            _context.EmpCreds.Add(empCred);
            await _context.SaveChangesAsync();

            /*if ((!string.IsNullOrEmpty(employee.WorkEmail) || !string.IsNullOrEmpty(employee.PersonalEmail)) && !string.IsNullOrEmpty(Username) && !string.IsNullOrEmpty(Password))
            {
                if (!string.IsNullOrEmpty(employee.WorkEmail))
                {
                    EmailService emailService = new EmailService(_context, _configuration);
                    string subject = "Welcome to the EMS";
                    string result = emailService.SendLoginCredentialEmail(employee.WorkEmail, subject, Username, Password);
                }
                else
                {
                    EmailService emailService = new EmailService(_context, _configuration);
                    string subject = "Welcome to the EMS";
                    string result = emailService.SendLoginCredentialEmail(employee.PersonalEmail, subject, Username, Password);
                }
            }
            else
            {
                return BadRequest("Email, Username or Password is missing for one or more employees.");
            }*/

            // Return the created employee directly with 201 status
            return StatusCode(201, employee1);
        }


        [HttpPost]
        [Route("UploadProfilePicture")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] ProfilePictureDTO profilePictureDTO)
        {
            if (profilePictureDTO == null || profilePictureDTO.ProfilePicture == null)
            {
                return BadRequest("Invalid profile picture data.");
            }


            var employee = await _context.Employees.FindAsync(profilePictureDTO.EmpID);
            var employee1 = await _context.EmpCreds.FindAsync(profilePictureDTO.EmpID);
            if (employee == null)
            {
                return NotFound("Employee not found.");
            }

            // Save the profile picture to the server
            var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProfilePictures");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }

            var fileName = $"{employee1.UserName}_PP.{profilePictureDTO.ProfilePicture.FileName.Split('.')[1]}";
            var filePath = Path.Combine(uploadsFolderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profilePictureDTO.ProfilePicture.CopyToAsync(stream);
            }

            // Update the employee's profile picture path
            employee.ProfilePicture = $"/ProfilePictures/{fileName}";
            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile picture uploaded successfully.", filePath = employee.ProfilePicture });
        }

        // DELETE: api/Employees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("TerminateorResign/{id}")]
        public async Task<IActionResult> TerminateorResignEmployee(int id, [FromBody] TerminateRehireDTO request)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }
            employee.DateofLeaving = request.DateofLeaving;
            employee.TerminateReasonOrLeavingReason = request.TerminateReasonOrLeavingReason;
            employee.IsActive = false;
            DateTime DateofLeaving = request.DateofLeaving ?? DateTime.Now;
            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Employee Profile",
                "Terminate or Resign Employee",
                $"Terminated/Resigned employee {employee.FirstName} {employee.LastName} with last working date {DateofLeaving.ToShortDateString()}",
                id.ToString(),
                null,
                JsonSerializer.Serialize(employee)
            );
            return Ok(new { employee.EmpID, employee.DateofLeaving, employee.IsActive });
        }

        [HttpPatch("Rehire/{id}")]
        public async Task<IActionResult> RejoinEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }
            employee.DateofRehire = DateTime.Now;
            employee.IsActive = true;
            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            await _logger.LogActivityAsync(
                "Employee Profile",
                "Rejoin Employee",
                $"Rejoined employee {employee.FirstName} {employee.LastName} with rejoining date {employee.DateofRehire?.ToShortDateString()}",
                id.ToString(),
                null,
                JsonSerializer.Serialize(employee)
            );
            return Ok(new { employee.EmpID, employee.DateofRehire, employee.IsActive });
        }

        [HttpGet("EmployeementHistorywithCompany/{id}")]
        public async Task<IActionResult> GetEmployeementHistorywithCompany(int id)
        {
            var employmentHistory = await (
                from e in _context.Employees
                join ual in _context.UserActivityLogs
                    on e.EmpID.ToString() equals ual.OnWhichEmployee
                join triggeredEmp in _context.Employees
                    on ual.TriggeredBy equals triggeredEmp.EmpID
                where e.EmpID == id
                select new
                {
                    e.EmpID,
                    ual.Action,
                    ual.TimeStamp,
                    TriggeredByName = triggeredEmp.FirstName + " " + triggeredEmp.LastName
                }
            ).ToListAsync();

            return Ok(employmentHistory);
        }


        private bool EmployeeExists(int id)
        {
            return _context.Employees.Any(e => e.EmpID == id);
        }

        public static IQueryable<T> ApplySorting<T>(IQueryable<T> source, string sortField, bool ascending)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var property = typeof(T).GetProperty(sortField, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

            if (property == null)
                return source; // If invalid field, return unsorted

            var propertyAccess = Expression.MakeMemberAccess(parameter, property);
            var orderByExp = Expression.Lambda(propertyAccess, parameter);

            string methodName = ascending ? "OrderBy" : "OrderByDescending";

            var resultExp = Expression.Call(typeof(Queryable), methodName,
                new Type[] { typeof(T), property.PropertyType },
                source.Expression, Expression.Quote(orderByExp));

            return source.Provider.CreateQuery<T>(resultExp);
        }
    }

    public class EmployeeSearchRequest
    {
        public string? Query { get; set; }

        // Column-specific filters
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PersonalEmail { get; set; }
        public string? WorkEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? EmergencyContact { get; set; }
        public string? EmergencyContactNumber { get; set; }
        public string? Gender { get; set; }

        public bool? OBStatus { get; set; }
        public bool? isActive { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortField { get; set; }
        public string? SortOrder { get; set; } = "asc"; // Default to ascending order
    }


    public class ProfilePictureDTO
    {
        public int EmpID { get; set; }
        public IFormFile ProfilePicture { get; set; }
    }


    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class TerminateRehireDTO
    {
        public DateTime? DateofLeaving { get; set; }

        public string? TerminateReasonOrLeavingReason { get; set; }
        public DateTime? DateofRehire { get; set; }
    }
}
