using EMS.Data;
using EMS.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMS.Services
{
    public interface IUserActivityLogger
    {
        Task LogActivityAsync(string category, string action, string description, 
            string onEmployee, string? oldValue = null, string? newValue = null);
    }

    public class UserActivityLogger : IUserActivityLogger
    {
        private readonly EMSDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserActivityLogger(EMSDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogActivityAsync(string category, string action, string description, 
            string onEmployee, string? oldValue = null, string? newValue = null)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var user = httpContext?.User;
            
            // Try to get EmpID from ClaimTypes.Name as seen in LoginController
            var triggeredByStr = user?.FindFirst(ClaimTypes.Name)?.Value;
            int triggeredBy = 0;
            if (!string.IsNullOrEmpty(triggeredByStr))
            {
                int.TryParse(triggeredByStr, out triggeredBy);
            }

            var controller = httpContext?.Request.RouteValues["controller"]?.ToString() ?? "Unknown";

            var log = new UserActivityLog
            {
                ActionCategory = category,
                Action = action,
                Description = description,
                OldValue = oldValue,
                NewValue = newValue,
                TriggeredBy = triggeredBy,
                InWhichController = controller,
                OnWhichEmployee = onEmployee,
                TimeStamp = DateTime.Now
            };

            _context.UserActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
