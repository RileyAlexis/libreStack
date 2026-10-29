using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Librestack.Models.APIModels;

namespace Librestack.Services;

public class UserManagerService : IUserManageService
{
    private readonly LibrestackDbContext _db;
    private readonly ILogger<UserManagerService> _logger;
    private readonly UserManager<ApplicationUserModel> _userManager;

    public UserManagerService(LibrestackDbContext db, ILogger<UserManagerService> logger, UserManager<ApplicationUserModel> userManager)
    {
        _db = db;
        _logger = logger;
        _userManager = userManager;
    }

    private long CalculateDirectorySize(string path)
    {
        if (!Directory.Exists(path)) return 0;

        long totalSize = 0;
        int filesProcessed = 0;
        const int MaxFilesToCount = 100_000; // Limit to prevent hanging on massive folders
        TimeSpan maxDuration = TimeSpan.FromSeconds(30); // Hard timeout
        var watch = Stopwatch.StartNew();

        // Use a stack for an iterative approach (safer than recursion)
        var stack = new Stack<string>();
        stack.Push(path);

        while (stack.Count > 0)
        {
            var currentPath = stack.Pop();

            // Check timeout periodically
            if (watch.Elapsed > maxDuration)
            {
                _logger.LogWarning("Directory size calculation timed out for path: {Path}", path);
                return -1; // Return sentinel value indicating timeout
            }

            try
            {
                var dirInfo = new DirectoryInfo(currentPath);

                // Process files in the current directory
                foreach (var file in dirInfo.GetFiles())
                {
                    totalSize += file.Length;
                    filesProcessed++;

                    if (filesProcessed > MaxFilesToCount)
                    {
                        _logger.LogWarning("Directory size reached limit of {Max} files for path: {Path}", MaxFilesToCount, path);
                        return totalSize; // Return what we have so far
                    }
                }

                // Add subdirectories to the stack for processing
                foreach (var dir in dirInfo.GetDirectories())
                {
                    stack.Push(dir.FullName);
                }
            }
            catch (UnauthorizedAccessException)
            {
                // Skip folders we don't have permission to read and continue
                continue;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accessing directory {Path}", currentPath);
            }
        }

        watch.Stop();
        return totalSize;
    }

    public async Task<Result> DeleteUser(string UserId)
    {
        var user = await _userManager.FindByIdAsync(UserId);
        if (user is null)
            return Result.Failure("User Not Found", ErrorType.NotFound);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        await _db.BookShares.Where(s => s.UserIdFrom == UserId || s.UserIdTo == UserId).ExecuteDeleteAsync();
        await _db.Books.Where(b => b.UserId == UserId).ExecuteDeleteAsync();
        await _db.Series.Where(s => s.UserId == UserId).ExecuteDeleteAsync();
        await _db.Collections.Where(c => c.UserId == UserId).ExecuteDeleteAsync();
        await _db.Libraries.Where(s => s.UserId == UserId).ExecuteDeleteAsync();
        await _db.ReadingProgress.Where(s => s.UserId == UserId).ExecuteDeleteAsync();
        await _db.Bookmarks.Where(s => s.UserId == UserId).ExecuteDeleteAsync();
        await _db.RefreshTokens.Where(s => s.UserId == UserId).ExecuteDeleteAsync();
        await _db.ParseErrors.Where(s => s.UserId == UserId).ExecuteDeleteAsync();
        await _db.UserSettings.Where(s => s.UserId == UserId).ExecuteDeleteAsync();

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
            return Result.Failure(
                string.Join("; ", result.Errors.Select(e => e.Description)),
                ErrorType.Unexpected);

        await transaction.CommitAsync();
        return Result.Success();
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

        user.IsActive = false;
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

        user.IsActive = true;
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
                IsActive = user.IsActive,
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