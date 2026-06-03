using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Librestack.Models;

namespace Librestack.Interfaces;

public interface IAuthService
{
    Task<IdentityResult> RegisterAsync(RegisterRequest request);
    Task<string?> LoginAsync(LoginRequest request);
    Task LogoutAsync();
    Task<AuthUserResponse?> GetCurrentUserAsync(ClaimsPrincipal user);
    Task<bool> RoleExistsAsync(string roleName);
    Task<IdentityResult> RegisterAdminUserAsync(RegisterRequest request);
    Task<bool> AssignRoleToUserAsync(string userId, string roleName);
}