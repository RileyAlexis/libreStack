using Microsoft.EntityFrameworkCore;

using Librestack.Database;
using Librestack.Models.APIModels;
using Librestack.Interfaces;
using Librestack.Models;
using Microsoft.Extensions.Configuration.UserSecrets;



namespace Librestack.Services;

public class ReadingProgressService : IReadingProgressService
{
    private readonly LibrestackDbContext _db;

    public ReadingProgressService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Result<ReadingProgress>> GetReadingProgress(int bookId, string userId)
    {
        var progress = await _db.ReadingProgress.FirstOrDefaultAsync(l => l.BookId == bookId && l.UserId == userId);
        if (progress is null)
            return Result<ReadingProgress>.Failure("Book not found", ErrorType.NotFound);

        return Result<ReadingProgress>.Success(progress);
    }

    public async Task<Result> ResetProgress(int bookId, string userId)
    {
        var entry = await _db.ReadingProgress.FirstOrDefaultAsync(l => l.BookId == bookId && l.UserId == userId);
        if (entry is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        _db.ReadingProgress.Remove(entry);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    // return Result<List<Book>>.Failure("No books found for user", ErrorType.NotFound);

    // return Result<List<Book>>.Success(result);

    public async Task<Result> UpdateProgress(string userId, APIReadingProgress readingProgress)
    {
        var existing = await _db.ReadingProgress
            .FirstOrDefaultAsync(p => p.BookId == readingProgress.BookId && p.UserId == userId);

        if (readingProgress.CfiLocation is null)
            return Result.Failure("Cfi Location string is rqeuired", ErrorType.BadRequest);

        var location = readingProgress.CfiLocation.ToString();

        if (existing is null)
        {
            var newProgress = new Models.ReadingProgress
            {
                UserId = userId,
                BookId = readingProgress.BookId,
                CfiLocation = location,
                LastRead = DateTime.UtcNow
            };
            await _db.ReadingProgress.AddAsync(newProgress);
            await _db.SaveChangesAsync();
            return Result.Success();
        }
        else
        {
            existing.CfiLocation = location;
            existing.LastRead = DateTime.UtcNow;
            _db.Update(existing);
            await _db.SaveChangesAsync();
            return Result.Success();
        }
    }
}