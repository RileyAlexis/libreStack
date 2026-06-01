using Microsoft.EntityFrameworkCore;

using Librestack.Database;
using Librestack.Models;
using Librestack.Models.APIModels;

namespace Librestack.Services;

public class BookmarkService : IBookmarkService
{
    private readonly LibrestackDbContext _db;

    public BookmarkService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<bool> CreateBookmark(int libraryId, string userId, ApiBookmarkModel apiBookmarkModel)
    {
        var result = await _db.Library.FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        if (result is null)
            return false;

        var newBookmark = new BookmarkModel
        {
            UserId = userId,
            Name = apiBookmarkModel.Name,
            LibraryId = result.Id,
            CfiLocation = apiBookmarkModel.CfiLocation,
        };

        await _db.Bookmarks.AddAsync(newBookmark);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteBookmark(int id, string userId)
    {
        var result = await _db.Bookmarks.FirstOrDefaultAsync(bookmark => bookmark.Id == id && bookmark.UserId == userId);
        if (result is null)
            return false;

        _db.Bookmarks.Remove(result);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateBookmark(int id, string userId, ApiBookmarkModel apiBookmarkModel)
    {
        var bookmark = await _db.Bookmarks.FirstOrDefaultAsync(bookmark => bookmark.Id == id && bookmark.UserId == userId);
        if (bookmark is null)
            return false;

        bookmark.Name = apiBookmarkModel.Name;
        bookmark.CfiLocation = apiBookmarkModel.CfiLocation;
        _db.Bookmarks.Update(bookmark);
        await _db.SaveChangesAsync();
        return true;

    }
}