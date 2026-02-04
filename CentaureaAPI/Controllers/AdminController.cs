using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;

namespace CentaureaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        [AdminOnly]
        [HttpGet("users", Name = "GetAllUsers")]
        public async Task<ActionResult<IEnumerable<AdminUserInfo>>> GetAllUsers(CancellationToken cancellationToken)
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync(cancellationToken);
                _logger.LogInformation("Admin retrieved user list. Total users: {UserCount}", users.Count());
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { error = "Failed to retrieve users" });
            }
        }
    }
}
