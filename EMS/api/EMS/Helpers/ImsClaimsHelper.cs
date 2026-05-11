using System.Security.Claims;
using System.Text.Json;

namespace EMS.Helpers
{
    /// <summary>
    /// Helper for extracting IMS user identity and permissions from JWT claims.
    /// IMS JWTs carry { id: MongoUserId, permissions: string[] }.
    /// These are distinct from CUPLEMS Employee records — the "id" here is an
    /// IMS MongoDB user ObjectId, not a CUPLEMS EmpID.
    /// </summary>
    public static class ImsClaimsHelper
    {
        /// <summary>
        /// Returns the IMS user's MongoDB ObjectId string.
        /// Use this for CreatedByImsId / UpdatedByImsId audit fields in new tables.
        /// </summary>
        public static string GetImsUserId(ClaimsPrincipal user)
        {
            return user.FindFirstValue("id")
                ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;
        }

        /// <summary>
        /// Checks whether the IMS user's JWT includes the given permission string
        /// (e.g., "employee.create", "payroll.process").
        /// </summary>
        public static bool HasPermission(ClaimsPrincipal user, string permission)
        {
            var permClaim = user.FindFirstValue("permissions");
            if (string.IsNullOrEmpty(permClaim))
                return false;

            try
            {
                var permissions = JsonSerializer.Deserialize<string[]>(permClaim);
                return permissions?.Contains(permission) ?? false;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Returns a 403 Forbidden result helper — call this in controllers
        /// when HasPermission returns false.
        /// Usage:
        ///   if (!ImsClaimsHelper.HasPermission(User, "employee.create"))
        ///       return Forbid();
        /// </summary>
        public static bool IsAuthenticated(ClaimsPrincipal user)
        {
            return user.Identity?.IsAuthenticated ?? false;
        }
    }
}
