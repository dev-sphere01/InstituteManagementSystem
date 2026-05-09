using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using System.Threading.Tasks.Dataflow;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public DepartmentsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/Departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetDepartments()
        {
            var depts = await _context.Departments.ToListAsync();
            List<object> result = new List<object>();
            foreach (var dept in depts) 
            {
                var empcount = await _context.EmpDeptPositions.Where(edp => edp.DeptID == dept.DeptID)
                    .Select(edp => edp.EmpID)
                    .Distinct()
                    .CountAsync();
                var empPositions = await _context.Positions.Where(ep=>ep.DeptID == dept.DeptID)
                    .Select(ep => ep.PositionID).Distinct().CountAsync();
                result.Add(new
                {
                    dept.DeptID,
                    dept.DeptName,
                    EmployeeCount = empcount,
                    PositionCount = empPositions
                });
            }

            return Ok(result);

        }

        // GET: api/Departments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound();
            }
            var empcount = await _context.EmpDeptPositions.Where(edp => edp.DeptID == id)
                .Select(edp => edp.EmpID)
                .Distinct()
                .CountAsync();
            var empPositions = await _context.Positions.Where(ep => ep.DeptID == id)
                    .Select(ep => ep.PositionID).Distinct().CountAsync();

            return Ok(new
            {
                department.DeptID,
                department.DeptName,
                EmployeeCount = empcount,
                PositionCount = empPositions
            });

        }

        [HttpGet("GetEmployeebydepartment")]
        public async Task<ActionResult<IEnumerable<object>>> GetEmployeebyDepartment(int id)
        {
            var employees = await (from emp in _context.Employees
                                   join edp in _context.EmpDeptPositions
                                        on emp.EmpID equals edp.EmpID
                                   join pos in _context.Positions
                                        on edp.PositionID equals pos.PositionID
                                   // LEFT JOIN to SalaryStructures
                                   join ss in _context.SalaryStructures
                                        on edp.PositionID equals ss.PositionID into salaryGroup

                                   from salary in salaryGroup.DefaultIfEmpty()
                                   where edp.DeptID == id
                                   select new
                                   {
                                       emp.EmpID,
                                       emp.FirstName,
                                       emp.LastName,
                                       emp.AtdEmpCode,
                                       edp.PositionID,
                                       pos.PositionName,
                                       edp.DeptID,
                                       edp.EmpTypeID,
                                       MinCTC = salary != null ? salary.MinCTC : (double?)null,
                                       MaxCTC = salary != null ? salary.MaxCTC : (double?)null,
                                       AverageCTC = salary != null ? salary.AverageCTC : (double?)null
                                   }).ToListAsync();

            if (!employees.Any())
            {
                return NotFound("No employees found for the specified department.");
            }

            return Ok(employees);
        }

        // PUT: api/Departments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDepartment(int id, Department department)
        {
            if (id != department.DeptID)
            {
                return BadRequest();
            }

            _context.Entry(department).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id))
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

        // POST: api/Departments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Department>> PostDepartment(Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDepartment", new { id = department.DeptID }, department);
        }

        // DELETE: api/Departments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DepartmentExists(int id)
        {
            return _context.Departments.Any(e => e.DeptID == id);
        }
    }
}
