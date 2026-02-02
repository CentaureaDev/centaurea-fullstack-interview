using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public interface IUserService
    {
        Task<User> RegisterAsync(string name, string email, string password, CancellationToken cancellationToken = default);
        Task<User?> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default);
        string GenerateToken(User user);
    }
}
