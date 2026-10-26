using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.AspNetCore.Identity;

namespace Librestack.Services;

public class UserManagerService : IUserManageService
{
    private readonly LibrestackDbContext _db;
    private readonly ILogger<UserManagerService> _logger;
    private readonly UserManager<IdentityUser> _userManager;

    public UserManagerService(LibrestackDbContext db, ILogger<UserManagerService> logger, UserManager<IdentityUser> userManager)
    {
        _db = db;
        _logger = logger;
        _userManager = userManager;
    }

    public Task<Result> DeleteUser(string UserId)
    {
        throw new NotImplementedException();
    }

    public Task<Result> DisableUser(string UserId)
    {
        throw new NotImplementedException();
    }

    public Task<Result<List<PasswordResetCode>>> GetActiveResetCodes()
    {
        throw new NotImplementedException();
    }

    public Task<Result<List<IdentityUser>>> GetAllUsers()
    {
        throw new NotImplementedException();
    }
}