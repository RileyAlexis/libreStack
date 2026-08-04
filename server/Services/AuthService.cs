using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;
using Librestack.Models;
using Librestack.Interfaces;
using Librestack.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Librestack.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly LibrestackDbContext _dbContext;

    public AuthService(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        LibrestackDbContext dbContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _dbContext = dbContext;
    }

    public async Task<IdentityResult> RegisterAsync(RegisterRequest request)
    {
        var config = await _dbContext.LibreStackConfig.FirstOrDefaultAsync();
        if (!config!.AllowNewUsers)
        {
            return IdentityResult.Failed(new IdentityError
            {
                Code = "Forbidden",
                Description = "Server settings do not allow registering of new users"
            });
        }

        var user = new IdentityUser { UserName = request.Username, Email = request.Email };
        var createResult = await _userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
        {
            return createResult;
        }

        var userSettings = new UserSettings { UserId = user.Id };
        _dbContext.UserSettings.Add(userSettings);
        await _dbContext.SaveChangesAsync();

        return createResult;
    }

    public async Task<(IdentityResult Result, string? UserId)> CreateNewUser(RegisterRequest request)
    {
        Console.WriteLine(request.ToString());

        var user = new IdentityUser { UserName = request.Username, Email = request.Email };
        var createResult = await _userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
        {
            return (createResult, null);
        }

        var userSettings = new UserSettings { UserId = user.Id, ShowLibraryAsHome = true };
        _dbContext.UserSettings.Add(userSettings);
        await _dbContext.SaveChangesAsync();

        return (createResult, user.Id);
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

        var roles = await _userManager.GetRolesAsync(user);

        return new AuthUserResponse(user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty);
    }

    public async Task<bool> RoleExistsAsync(string roleName)
    {
        return await _roleManager.RoleExistsAsync(roleName);
    }

    public async Task<IdentityResult> RegisterAdminUserAsync(RegisterRequest request)
    {
        if (await AdminUserExists())
            return IdentityResult.Failed(new IdentityError
            {
                Code = "AdminAlreadyExists",
                Description = "An admin user already exists."
            });

        var user = new IdentityUser { UserName = request.Username, Email = request.Email };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return result;

        var roleResult = await _userManager.AddToRoleAsync(user, "Admin");
        var userSettings = new UserSettings { UserId = user.Id };
        _dbContext.UserSettings.Add(userSettings);
        await _dbContext.SaveChangesAsync();
        return roleResult;
    }

    public async Task<bool> AssignRoleToUserAsync(string userId, string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return false;

        var roleExists = await _roleManager.RoleExistsAsync(roleName);
        if (!roleExists)
            return false;

        var result = await _userManager.AddToRoleAsync(user, roleName);
        return result.Succeeded;
    }

    private async Task<string> GenerateJwtToken(IdentityUser user)
    {
        var jwtKey = _configuration["JWT_KEY"] ?? throw new InvalidOperationException("JWT_KEY is not configured");
        var jwtIssuer = _configuration["JWT_ISSUER"] ?? throw new InvalidOperationException("JWT_ISSUER is not configured");
        var jwtAudience = _configuration["JWT_AUDIENCE"] ?? throw new InvalidOperationException("JWT_AUDIENCE is not configured");
        var expirationMinutes = int.Parse(_configuration["JWT_EXPIRY_MINUTES"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        var roleClaims = roles.Select(role => new Claim(ClaimTypes.Role, role)).ToList();

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roleClaims);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<bool> AdminUserExists()
    {
        var admins = await _userManager.GetUsersInRoleAsync("Admin");
        return admins != null && admins.Any();
    }

    private static string CreateRandomToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string HashToken(string token)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    public async Task<LoginResponse?> LoginWithRefreshAsync(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user is null)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return null;

        var accessToken = await GenerateJwtToken(user);

        var rawRefresh = CreateRandomToken();
        var hashed = HashToken(rawRefresh);
        var expiryDays = int.Parse(_configuration["JWT_REFRESH_EXPIRY_DAYS"] ?? "14");

        var refreshEntity = new RefreshToken
        {
            HashedToken = hashed,
            UserId = user.Id,
            Created = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(expiryDays)
        };

        _dbContext.RefreshTokens.Add(refreshEntity);
        await _dbContext.SaveChangesAsync();

        return new LoginResponse(accessToken, rawRefresh);
    }

    public async Task<RefreshResponse?> RefreshAccessTokenAsync(string refreshToken)
    {
        var hashed = HashToken(refreshToken);
        var tokenEntity = await _dbContext.RefreshTokens.FirstOrDefaultAsync(t => t.HashedToken == hashed);
        if (tokenEntity == null || !tokenEntity.IsActive)
            return null;

        var user = await _userManager.FindByIdAsync(tokenEntity.UserId);
        if (user == null)
            return null;

        // Revoke current and rotate
        tokenEntity.Revoked = DateTime.UtcNow;

        var newRaw = CreateRandomToken();
        var newHashed = HashToken(newRaw);
        tokenEntity.ReplacedByHash = newHashed;

        var expiryDays = int.Parse(_configuration["JWT_REFRESH_EXPIRY_DAYS"] ?? "14");
        var newEntity = new RefreshToken
        {
            HashedToken = newHashed,
            UserId = user.Id,
            Created = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(expiryDays)
        };

        _dbContext.RefreshTokens.Add(newEntity);
        await _dbContext.SaveChangesAsync();

        var newJwt = await GenerateJwtToken(user);
        return new RefreshResponse(newJwt, newRaw);
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
        var hashed = HashToken(refreshToken);
        var tokenEntity = await _dbContext.RefreshTokens.FirstOrDefaultAsync(t => t.HashedToken == hashed);
        if (tokenEntity == null || tokenEntity.Revoked != null)
            return false;

        tokenEntity.Revoked = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return true;
    }


}
