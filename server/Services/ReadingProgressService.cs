using Microsoft.EntityFrameworkCore;

using Librestack.Database;
using Librestack.Models.APIModels;


namespace Librestack.Services;

public class ReadingProgressService : IReadingProgressService
{
    private readonly LibrestackDbContext _db;

    public async Task<bool> ResetProgress(int libraryId, string userId)
    {
        var entry = await _db.ReadingProgress.FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        if (entry is null)
            return false;

        _db.ReadingProgress.Remove(entry);
        await _db.SaveChangesAsync();
        return true;
    }

    public ReadingProgressService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<bool> UpdateProgress(int libraryId, string userId, APIReadingProgress readingProgress)
    {
        var existing = await _db.ReadingProgress
            .FirstOrDefaultAsync(p => p.LibraryId == libraryId && p.UserId == userId);

        if (existing is null)
        {
            var newProgress = new Models.ReadingProgress
            {
                UserId = userId,
                LibraryId = libraryId,
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