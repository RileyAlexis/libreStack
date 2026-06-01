using Librestack.Models;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class LibraryTagService : ILibraryTagService
{
    private readonly LibrestackDbContext _db;

    public LibraryTagService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<List<LibraryTag>> GetAllTags(string userId)
    {
        var tags = await _db.LibraryTags.Where(l => l.UserId == userId || l.UserId == null).OrderBy(l => l.Id).ToListAsync();
        return tags;
    }

    public async Task<List<LibraryTag>> GetAllUserTags(string userId)
    {
        return await _db.LibraryTags.Where(l => l.UserId == userId).OrderBy(l => l.Id).ToListAsync();
    }

    public async Task<LibraryTag?> GetUserTag(string userId, int id)
    {
        var tag = await _db.LibraryTags.FirstOrDefaultAsync(l => l.UserId == userId && l.Id == id);
        if (tag is null)
            return null;

        return tag;
    }


    public async Task<bool> UpdateUserTag(string userId, LibraryTag libraryTag)
    {
        var existingTag = await _db.LibraryTags.FirstOrDefaultAsync(l => l.Id == libraryTag.Id && l.UserId == userId);
        if (existingTag is null)
            return false;
        existingTag.Tag = libraryTag.Tag;

        _db.LibraryTags.Update(existingTag);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserTag(string userId, int id)
    {
        var tagEntry = await _db.LibraryTags.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (tagEntry is null)
            return false;

        _db.LibraryTags.Remove(tagEntry);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CreateUserTag(string userId, LibraryTag libraryTag)
    {
        if (string.IsNullOrWhiteSpace(userId) || libraryTag is null)
            return false;

        libraryTag.UserId = userId;
        await _db.LibraryTags.AddAsync(libraryTag);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApplyTag(string userId, int libraryId, int tagId)
    {
        Console.WriteLine($"{tagId}, userId, libraryId");

        var tagToApply = await _db.LibraryTags.FirstOrDefaultAsync(l => l.Id == tagId);
        Console.WriteLine(tagToApply);
        if (tagToApply is null)
            return false;

        var libraryEntry = await _db.Library.FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        Console.WriteLine(libraryEntry);
        if (libraryEntry is null)
            return false;

        libraryEntry.LibraryTags.Add(tagToApply);
        await _db.SaveChangesAsync();
        return true;
    }
}
