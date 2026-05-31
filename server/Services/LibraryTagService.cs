using Librestack.Models;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class LibraryTagService : InterfaceLibraryTagService
{
    private readonly LibrestackDbContext _db;

    public LibraryTagService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<List<LibraryTag>> GetAllTags(string userId)
    {
        var tags = await _db.LibraryTags.Where(l => l.UserId == userId && l.UserId == null).ToListAsync();
        return tags;
    }

    public async Task<List<LibraryTag>> GetAllUserTags(string userId)
    {
        return await _db.LibraryTags.Where(l => l.UserId == userId).ToListAsync();
    }


    public async Task<bool> UpdateUserTag(string userId, LibraryTag libraryTag)
    {
        var existingTag = await _db.LibraryTags.FirstOrDefaultAsync(l => l.Id == libraryTag.Id || l.UserId == userId);
        if (existingTag is null)
            return false;

        _db.LibraryTags.Update(existingTag);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserTag(string userId, LibraryTag libraryTag)
    {
        var tagEntry = await _db.LibraryTags.FirstOrDefaultAsync(l => l.Id == libraryTag.Id && l.UserId == userId);
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

    public Task<bool> ApplyTag(string userId, int libraryTagId, int libraryId)
    {
        throw new NotImplementedException();
    }
}
