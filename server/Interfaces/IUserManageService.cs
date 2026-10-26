using Librestack.Models;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Interfaces;

public interface IUserManageService
{
    Task<Result<List<IdentityUser>>> GetAllUsers();
    Task<Result<List<PasswordResetCode>>> GetActiveResetCodes();
    Task<Result> DisableUser(string UserId);
    Task<Result> DeleteUser(string UserId);
}