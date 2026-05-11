using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;
using System.Linq.Expressions;
using System.Reflection;

namespace EMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionsController : ControllerBase
    {
        private readonly EMSDbContext _context;

        public PositionsController(EMSDbContext context)
        {
            _context = context;
        }

        // GET: api/Positions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Position>>> GetPositions()
        {
            return await _context.Positions.ToListAsync();
        }

        [HttpGet("ByDepartment/{DeptId}")]

        public async Task<ActionResult<List<Position>>> GetPositionByDepartment(int DeptId)
        {
            var position = await _context.Positions.Where(p => p.DeptID == DeptId).ToListAsync();
            if (position == null || !position.Any())
            {
                return NotFound();
            }
            return position;
        }

        // GET: api/Positions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Position>> GetPosition(int id)
        {
            var position = await _context.Positions.FindAsync(id);

            if (position == null)
            {
                return NotFound();
            }

            return position;
        }

        [HttpGet("GetpositionbyEmpID/{id}")]
        public async Task<ActionResult<Position>> GetpositionbyEmpID(int id)
        {
            var empDeptPos = await _context.EmpDeptPositions.FirstOrDefaultAsync(edp => edp.EmpID == id);
            if (empDeptPos == null)
            {
                return NotFound();
            }

            var position = await _context.Positions.FindAsync(empDeptPos.PositionID);
            if (position == null)
            {
                return NotFound();
            }

            return position;
        }


        [HttpPost("Search")]
        public async Task<ActionResult<PaginatedResponse<Position>>> GetEmployeesWithSearch([FromBody] PositionSearchRequest request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;

            var queryable = _context.Positions.AsQueryable();

            // 🔍 Global search
            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                var term = request.Query.ToLower();
                queryable = queryable.Where(e =>
                    (e.PositionName != null && e.PositionName.ToLower().Contains(term))
                );
            }

            // 🎯 Column-specific filters
            
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
                queryable = queryable.OrderBy(e => e.PositionID);
            }

            var employees = await queryable
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var response = new PaginatedResponse<Position>
            {
                Data = employees,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = totalPages
            };

            return Ok(response);
        }

        // PUT: api/Positions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPosition(int id, Position position)
        {
            if (id != position.PositionID)
            {
                return BadRequest();
            }

            _context.Entry(position).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PositionExists(id))
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

        [HttpGet("GetPositionsByDepartment/{departmentId}")]
        public async Task<ActionResult<IEnumerable<Position>>> GetPositionsByDepartment(int departmentId)
        {
            var positions = await _context.Positions
                .Where(p => p.DeptID == departmentId)
                .ToListAsync();

            if (positions == null || !positions.Any())
            {
                return NotFound();
            }

            return positions;
        }

        // POST: api/Positions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Position>> PostPosition(Position position)
        {
            _context.Positions.Add(position);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPosition", new { id = position.PositionID }, position);
        }

        // DELETE: api/Positions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var position = await _context.Positions.FindAsync(id);
            if (position == null)
            {
                return NotFound();
            }

            _context.Positions.Remove(position);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool PositionExists(int id)
        {
            return _context.Positions.Any(e => e.PositionID == id);
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
        [HttpGet("EmployeeCountbyDept")]
        public async Task<ActionResult<int>> GetEmployeeCountbyDept(int DeptID)
        {
            var count = await _context.EmpDeptPositions.Where(edp => edp.DeptID == DeptID)
                .Select(edp => edp.EmpID)
                .Distinct()
                .CountAsync();

            return count;
        }

    }
    public class PositionSearchRequest
    {
        public string? Query { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortField { get; set; }
        public string? SortOrder { get; set; } = "asc"; // Default to ascending order
    }
    public class PaginatedResponsePosition<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
