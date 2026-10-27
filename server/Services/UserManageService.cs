using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;

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

    private long CalculateDirectorySize(string path)
    {
        if (!Directory.Exists(path)) return 0;

        long totalSize = 0;
        var files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            try
            {
                FileInfo fi = new FileInfo(file);
                totalSize += fi.Length;
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Access denied when reading file {file}: {ex.Message}");
            }
        }

        return totalSize;
    }

    public Task<Result> DeleteUser(string UserId)
    {
        throw new NotImplementedException();
    }

    public async Task<Result> DisableUser(string userId)
    {
        _logger.LogInformation("Attempting to disable user account: {UserId}", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Disable failed: User {UserId} not found.", userId);
            return Result.Failure("User not found.", ErrorType.NotFound);
        }

        user.LockoutEnabled = true;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogError("Failed to disable user {UserId}: {Errors}", userId, errors);
            return Result.Failure($"Failed to disable user: {errors}", ErrorType.Unexpected);
        }

        _logger.LogInformation("Successfully disabled user account: {UserId}", userId);
        return Result.Success();
    }

    public async Task<Result> EnableUser(string userId)
    {
        _logger.LogInformation("Attempting to enable user account: {UserId}", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Enable failed: User {UserId} not found.", userId);
            return Result.Failure("User not found.", ErrorType.NotFound);
        }

        user.LockoutEnabled = false;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogError("Failed to enable user {UserId}: {Errors}", userId, errors);
            return Result.Failure($"Failed to enable user: {errors}", ErrorType.Unexpected);
        }

        _logger.LogInformation("Successfully enabled user account: {UserId}", userId);
        return Result.Success();
    }

    public Task<Result<List<PasswordResetCode>>> GetActiveResetCodes()
    {
        throw new NotImplementedException();
    }

    public async Task<Result<List<UserListDTO>>> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var userList = new List<UserListDTO>();
        if (users is null)
            return Result<List<UserListDTO>>.Failure("User list not found", ErrorType.Unexpected);

        foreach (var user in users)
        {
            var resetCode = await _db.PasswordResetCodes.Where(c => c.UserId == user.Id && !c.Used && DateTime.UtcNow < c.ExpiresAt).FirstOrDefaultAsync();
            var libraries = await _db.Libraries.Where(l => l.UserId == user.Id).Select(l => new LibraryDTOForUserList
            {
                Id = l.Id,
                Name = l.Name,
                LibraryPath = l.LibraryPath,
                BookCount = l.Books.Count(),
            }).ToListAsync();

            var libraryData = libraries.Select(l => new LibraryDTOForUserList
            {
                Id = l.Id,
                Name = l.Name,
                BookCount = l.BookCount,
                LibraryPath = l.LibraryPath,
                StorageSizeKb = CalculateDirectorySize(l.LibraryPath) / 1024
            }).ToList();

            userList.Add(new UserListDTO
            {
                Id = user.Id,
                UserName = user.UserName!,
                Email = user.Email ?? string.Empty,
                AccessFailedCount = user.AccessFailedCount,
                EmailConfirmed = user.EmailConfirmed,
                LockoutEnabled = user.LockoutEnabled,
                LockoutEnd = user.LockoutEnd ?? DateTime.MinValue,
                ResetCode = resetCode ?? null,
                Libraries = libraryData,
            });
        }

        return Result<List<UserListDTO>>.Success(userList);
    }
}