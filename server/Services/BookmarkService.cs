using Microsoft.EntityFrameworkCore;

using Librestack.Database;
using Librestack.Models;
using Librestack.Models.APIModels;
using Librestack.Interfaces;

namespace Librestack.Services;

public class BookmarkService : IBookmarkService
{
    private readonly LibrestackDbContext _db;

    public BookmarkService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Result<BookmarkModel>> CreateBookmark(int BookId, string userId, ApiBookmarkModel apiBookmarkModel)
    {
        var result = await _db.Books.FirstOrDefaultAsync(l => l.Id == BookId && l.UserId == userId);
        if (result is null)
            return Result<BookmarkModel>.Failure("Book not found", ErrorType.NotFound);

        var newBookmark = new BookmarkModel
        {
            UserId = userId,
            Name = apiBookmarkModel.Name,
            BookId = result.Id,
            CfiLocation = apiBookmarkModel.CfiLocation,
        };

        await _db.Bookmarks.AddAsync(newBookmark);
        await _db.SaveChangesAsync();
        return Result<BookmarkModel>.Success(newBookmark);
    }

    public async Task<Result<BookmarkModel>> DeleteBookmark(int id, string userId)
    {
        var result = await _db.Bookmarks.FirstOrDefaultAsync(bookmark => bookmark.Id == id && bookmark.UserId == userId);
        if (result is null)
            return Result<BookmarkModel>.Failure("Bookmark not found", ErrorType.NotFound);

        _db.Bookmarks.Remove(result);
        await _db.SaveChangesAsync();
        return Result<BookmarkModel>.Success(result);
    }

    public async Task<Result<List<BookmarkModel>>> GetBookmarksByBookId(string userId, int bookId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<List<BookmarkModel>>.Failure("UserId not found or is incorrect", ErrorType.NotFound);

        var result = await _db.Bookmarks.Where(b => b.UserId == userId && b.BookId == bookId).ToListAsync();
        if (result is null)
            return Result<List<BookmarkModel>>.Failure("Book or bookmark not found", ErrorType.NotFound);

        return Result<List<BookmarkModel>>.Success(result);
    }

    public async Task<Result> UpdateBookmark(string userId, ApiBookmarkModel apiBookmarkModel)
    {
        var bookmark = await _db.Bookmarks.FirstOrDefaultAsync(bookmark => bookmark.Id == apiBookmarkModel.Id && bookmark.UserId == userId);
        if (bookmark is null)
            return Result.Failure("Bookmark not found", ErrorType.NotFound);

        bookmark.Name = apiBookmarkModel.Name;
        bookmark.CfiLocation = apiBookmarkModel.CfiLocation;
        _db.Bookmarks.Update(bookmark);
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}