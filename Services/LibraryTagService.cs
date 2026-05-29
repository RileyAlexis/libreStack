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

    public async Task<bool> CreateUserTag(string userId, LibraryTag libraryTag)
    {
        if (string.IsNullOrWhiteSpace(userId) || libraryTag is null)
            return false;

        libraryTag.UserId = userId;
        await _db.LibraryTags.AddAsync(libraryTag);
        return await _db.SaveChangesAsync() > 0;
    }

    public Task<bool> ApplyTag(string userId, int libraryTagId, int libraryId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteUserTag(string userId, LibraryTag libraryTag)
    {
        throw new NotImplementedException();
    }

    public Task<List<LibraryTag>> GetAllTags(string userId)
    {
        throw new NotImplementedException();
    }

    public Task<LibraryTag> GetTap(int id, string userId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateUserTag(string userId, LibraryTag libraryTag)
    {
        throw new NotImplementedException();
    }
}