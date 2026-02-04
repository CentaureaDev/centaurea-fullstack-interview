using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<AdminUserInfo>> GetAllUsersAsync(CancellationToken cancellationToken = default);
        Task EnsureAdminUserExistsAsync(CancellationToken cancellationToken = default);
    }

    public class AdminUserInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}
