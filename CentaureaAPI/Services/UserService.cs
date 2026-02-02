using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CentaureaAPI.Data;
using CentaureaAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CentaureaAPI.Services
{
    public class UserService : IUserService
    {
        private const int SaltSize = 16;
        private const int KeySize = 32;
        private const int Iterations = 100_000;

        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public UserService(ApplicationDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        public async Task<User> RegisterAsync(string name, string email, string password, CancellationToken cancellationToken = default)
        {
            string normalizedEmail = email.Trim().ToLowerInvariant();
            bool exists = await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
            if (exists)
            {
                throw new InvalidOperationException("A user with this email already exists.");
            }

            byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
            byte[] hash = HashPassword(password, salt);

            User user = new User
            {
                Name = name.Trim(),
                Email = normalizedEmail,
                PasswordHash = hash,
                PasswordSalt = salt,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return user;
        }

        public async Task<User?> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            string normalizedEmail = email.Trim().ToLowerInvariant();
            User? user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
            if (user == null)
            {
                return null;
            }

            byte[] hash = HashPassword(password, user.PasswordSalt);
            if (!CryptographicOperations.FixedTimeEquals(hash, user.PasswordHash))
            {
                return null;
            }

            return user;
        }

        public string GenerateToken(User user)
        {
            string key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured");
            string issuer = _configuration["Jwt:Issuer"] ?? "CentaureaAPI";
            string audience = _configuration["Jwt:Audience"] ?? "CentaureaAPIUsers";
            int expiresMinutes = int.TryParse(_configuration["Jwt:ExpiresMinutes"], out int mins) ? mins : 60;

            SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            SigningCredentials credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            Claim[] claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name)
            };

            JwtSecurityToken token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static byte[] HashPassword(string password, byte[] salt)
        {
            return Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                KeySize);
        }
    }
}
