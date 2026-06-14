using Microsoft.EntityFrameworkCore;

using Librestack.Database;
using Librestack.Models.APIModels;
using Librestack.Interfaces;



namespace Librestack.Services;

public class ReadingProgressService : IReadingProgressService
{
    private readonly LibrestackDbContext _db;

    public ReadingProgressService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<bool> ResetProgress(int bookId, string userId)
    {
        var entry = await _db.ReadingProgress.FirstOrDefaultAsync(l => l.BookId == bookId && l.UserId == userId);
        if (entry is null)
            return false;

        _db.ReadingProgress.Remove(entry);
        await _db.SaveChangesAsync();
        return true;
    }


    public async Task<bool> UpdateProgress(string userId, APIReadingProgress readingProgress)
    {
        var existing = await _db.ReadingProgress
            .FirstOrDefaultAsync(p => p.BookId == readingProgress.BookId && p.UserId == userId);

        if (existing is null)
        {
            var newProgress = new Models.ReadingProgress
            {
                UserId = userId,
                BookId = readingProgress.BookId,
                CfiLocation = readingProgress.CfiLocation,
                LastRead = DateTime.UtcNow
            };
            await _db.ReadingProgress.AddAsync(newProgress);
        }
        else
        {
            existing.CfiLocation = readingProgress.CfiLocation;
            existing.LastRead = DateTime.UtcNow;
        }

        return await _db.SaveChangesAsync() > 0;
    }
}