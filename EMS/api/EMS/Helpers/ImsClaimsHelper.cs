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
            if (user == null) return string.Empty;
            return user.FindFirstValue("id")
                ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub")
                ?? string.Empty;
        }

        /// <summary>
        /// Checks whether the IMS user's JWT includes the given permission string
        /// (e.g., "employee.create", "payroll.process") or the wildcard "*".
        /// </summary>
        public static bool HasPermission(ClaimsPrincipal user, string permission)
        {
            if (user == null) return false;

            // 1. Check all individual claims of type "permissions"
            var permClaims = user.FindAll("permissions").Select(c => c.Value).ToList();
            if (permClaims.Contains("*") || permClaims.Contains(permission))
                return true;

            // 2. Also handle if the claim value was packed into a JSON array string or comma separated
            foreach (var val in permClaims)
            {
                if (string.IsNullOrWhiteSpace(val)) continue;
                if (val == "*" || val == permission) return true;

                if (val.StartsWith("[") && val.EndsWith("]"))
                {
                    try
                    {
                        var list = JsonSerializer.Deserialize<string[]>(val);
                        if (list != null && (list.Contains("*") || list.Contains(permission)))
                            return true;
                    }
                    catch { }
                }
            }

            return false;
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
