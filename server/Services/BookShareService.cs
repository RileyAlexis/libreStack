using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class BookShareService(LibrestackDbContext db) : IBookShareService
{
    private readonly LibrestackDbContext _db = db;

    public async Task<Result> ShareBook(string userIdOwner, string userIdRecipient, int BookId)
    {
        if (string.IsNullOrEmpty(userIdOwner) || string.IsNullOrEmpty(userIdRecipient))
            return Result.Failure("Requires userIdOwner and userIdRecipient", ErrorType.BadRequest);

        var book = await _db.Books.FirstOrDefaultAsync(l => l.Id == BookId && l.UserId == userIdOwner);
        if (book is null) return Result.Failure("Book Not found", ErrorType.NotFound);

        var bookShare = new BookShare
        {
            UserIdFrom = userIdOwner,
            UserIdTo = userIdRecipient,
            BookId = BookId
        };

        await _db.BookShares.AddAsync(bookShare);
        await _db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> UnshareBook(string userIdOwner, string userIdRecipient, int BookId)
    {
        if (string.IsNullOrEmpty(userIdOwner) || string.IsNullOrEmpty(userIdRecipient))
            return Result.Failure("Requires userIdOwner and userIdRecipient", ErrorType.BadRequest);

        var bookshare = await _db.BookShares.FirstOrDefaultAsync(l => l.UserIdFrom == userIdOwner && l.UserIdTo == userIdRecipient && l.BookId == BookId);
        if (bookshare is null) return Result.Failure("Book Share Not found", ErrorType.NotFound);

        _db.BookShares.Remove(bookshare);
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}