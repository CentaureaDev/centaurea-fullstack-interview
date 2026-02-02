using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CentaureaAPI.Services;

namespace CentaureaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost("register", Name = "RegisterUser")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "Name, email, and password are required." });
            }

            try
            {
                var user = await _userService.RegisterAsync(request.Name, request.Email, request.Password, cancellationToken);
                string token = _userService.GenerateToken(user);

                return Ok(new AuthResponse
                {
                    Token = token,
                    User = new AuthUser
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("login", Name = "LoginUser")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "Email and password are required." });
            }

            var user = await _userService.AuthenticateAsync(request.Email, request.Password, cancellationToken);
            if (user == null)
            {
                return Unauthorized(new { error = "Invalid email or password." });
            }

            string token = _userService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new AuthUser
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                }
            });
        }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public AuthUser User { get; set; } = new AuthUser();
    }

    public class AuthUser
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
