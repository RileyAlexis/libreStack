using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;

namespace Librestack.Services;

public class UserSettingsService : IUserSettingsService
{
    private readonly LibrestackDbContext _db;

    public UserSettingsService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Result<List<ApiUserModel>>> GetLocalUsers(string UserId)
    {
        if (string.IsNullOrEmpty(UserId))
            return Result<List<ApiUserModel>>.Failure("User Id is required", ErrorType.BadRequest);

        var users = await _db.Users.Where(u => u.Id != UserId)
        .Select(u => new ApiUserModel
        {
            UserId = u.Id,
            UserName = u.UserName
        }).ToListAsync();

        return Result<List<ApiUserModel>>.Success(users);
    }

    public async Task<Result<UserSettings>> GetUserSettings(string UserId)
    {
        var result = await _db.UserSettings.FirstOrDefaultAsync(l => l.UserId == UserId);

        if (result is null)
            return Result<UserSettings>.Failure("User not found", ErrorType.NotFound);

        return Result<UserSettings>.Success(result);
    }

    public async Task<Result> UpdateUserSettings(UserSettings settings, string UserId)
    {
        var existing = await _db.UserSettings.FirstOrDefaultAsync(l => l.UserId == UserId);
        if (existing is null)
        {
            settings.UserId = UserId;
            _db.UserSettings.Add(settings);
        }
        else
        {
            existing.ShowLibraryAsHome = settings.ShowLibraryAsHome;
            existing.ReadingTheme = settings.ReadingTheme;
            existing.Spread = settings.Spread;
            existing.ReadingFontLabel = settings.ReadingFontLabel;
            existing.ReadingFontValue = settings.ReadingFontValue;
            existing.ReadingFontSize = settings.ReadingFontSize;
            existing.LineHeight = settings.LineHeight;
            existing.LibraryBase = settings.LibraryBase;
            existing.ShowTitles = settings.ShowTitles;
            existing.ShowAuthors = settings.ShowAuthors;
            existing.ShowSeries = settings.ShowSeries;
            existing.ShowCollections = settings.ShowCollections;
            existing.ShowCompleted = settings.ShowCompleted;
            existing.ShowDescriptionOnHover = settings.ShowDescriptionOnHover;
            existing.CoverWidth = settings.CoverWidth;
            existing.CoverHeight = settings.CoverHeight;
            existing.SortBy = settings.SortBy;
            existing.SortAscending = settings.SortAscending;
            existing.LastSelectedLibrary = settings.LastSelectedLibrary;
            existing.GroupBySeries = settings.GroupBySeries;
            existing.GroupByCollections = settings.GroupByCollections;
            existing.ShowSharedBooks = settings.ShowSharedBooks;
        }

        await _db.SaveChangesAsync();
        return Result.Success();
    }
}