using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace CentaureaAPI.Infrastructure
{
    /// <summary>
    /// Custom authorization attribute that only allows admin users (admin@admin.com).
    /// Must be used in conjunction with [Authorize].
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AdminOnlyAttribute : Attribute, IAuthorizationFilter
    {
        private const string ADMIN_EMAIL = "admin@admin.com";

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            var user = context.HttpContext.User;

            // User must be authenticated
            if (!user?.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // User must have admin email
            var userEmail = user.FindFirstValue(ClaimTypes.Email);
            if (userEmail != ADMIN_EMAIL)
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}
