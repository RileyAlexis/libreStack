using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Librestack.Models;

namespace Librestack.Interfaces;

public interface IAuthService
{
    Task<IdentityResult> RegisterAsync(RegisterRequest request);
    Task<LoginResponse?> LoginWithRefreshAsync(LoginRequest request);
    Task<RefreshResponse?> RefreshAccessTokenAsync(string refreshToken);
    Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    Task LogoutAsync();
    Task<AuthUserResponse?> GetCurrentUserAsync(ClaimsPrincipal user);
    Task<bool> RoleExistsAsync(string roleName);
    Task<IdentityResult> RegisterAdminUserAsync(RegisterRequest request);
    Task<bool> AssignRoleToUserAsync(string userId, string roleName);
    Task<bool> AdminUserExists();
    Task<(IdentityResult Result, string? UserId)> CreateNewUser(RegisterRequest request);
}