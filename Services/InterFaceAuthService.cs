using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Librestack.Models;

namespace Librestack.Services;

public interface IAuthService
{
    Task<IdentityResult> RegisterAsync(RegisterRequest request);
    Task<string?> LoginAsync(LoginRequest request);
    Task LogoutAsync();
    Task<AuthUserResponse?> GetCurrentUserAsync(ClaimsPrincipal user);
}