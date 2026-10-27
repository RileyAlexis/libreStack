using Librestack.Models;
using Librestack.Models.APIModels;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Interfaces;

public interface IUserManageService
{
    Task<Result<List<UserListDTO>>> GetAllUsers();
    Task<Result<List<PasswordResetCode>>> GetActiveResetCodes();
    Task<Result> DisableUser(string UserId);
    Task<Result> EnableUser(string UserId);
    Task<Result> DeleteUser(string UserId);
}