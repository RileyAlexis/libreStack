using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Librestack.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Librestack.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    public async Task<IdentityResult> RegisterAsync(RegisterRequest request)
    {
        var user = new IdentityUser { UserName = request.Username, Email = request.Email };
        return await _userManager.CreateAsync(user, request.Password);
    }

    public async Task<string?> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user is null)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return null;

        return GenerateJwtToken(user);
    }

    public Task LogoutAsync()
    {
        return _signInManager.SignOutAsync();
    }

    public async Task<AuthUserResponse?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return null;

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return null;

        return new AuthUserResponse(user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty);
    }

    private string GenerateJwtToken(IdentityUser user)
    {
        var jwtKey = _configuration["JWT_KEY"] ?? throw new InvalidOperationException("JWT_KEY is not configured");
        var jwtIssuer = _configuration["JWT_ISSUER"] ?? throw new InvalidOperationException("JWT_ISSUER is not configured");
        var jwtAudience = _configuration["JWT_AUDIENCE"] ?? throw new InvalidOperationException("JWT_AUDIENCE is not configured");
        var expirationMinutes = int.Parse(_configuration["JWT_EXPIRY_MINUTES"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
