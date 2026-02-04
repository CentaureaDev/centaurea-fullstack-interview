using CentaureaAPI.Data;
using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IUserService _userService;
        private readonly ILogger<AdminService> _logger;

        private const string ADMIN_EMAIL = "admin@admin.com";
        private const string ADMIN_PASSWORD = "77777";
        private const string ADMIN_NAME = "Administrator";

        public AdminService(ApplicationDbContext dbContext, IUserService userService, ILogger<AdminService> logger)
        {
            _dbContext = dbContext;
            _userService = userService;
            _logger = logger;
        }

        public async Task<IEnumerable<AdminUserInfo>> GetAllUsersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var users = _dbContext.Users
                    .Select(u => new AdminUserInfo
                    {
                        Id = u.Id,
                        Name = u.Name,
                        Email = u.Email,
                        CreatedAt = u.CreatedAt.ToString("O") // ISO 8601 format
                    })
                    .ToList();

                _logger.LogInformation("Retrieved {UserCount} users from database", users.Count);
                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task EnsureAdminUserExistsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var existingAdmin = _dbContext.Users.FirstOrDefault(u => u.Email == ADMIN_EMAIL);
                
                if (existingAdmin != null)
                {
                    _logger.LogInformation("Admin user already exists");
                    return;
                }

                // Create admin user
                var adminUser = await _userService.RegisterAsync(ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, cancellationToken);
                _logger.LogInformation("Admin user created successfully with email: {Email}", ADMIN_EMAIL);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                _logger.LogInformation("Admin user already exists (caught during registration)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin user");
                throw;
            }
        }
    }
}
