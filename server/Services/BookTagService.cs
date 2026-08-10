using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class BookTagService : IBookTagService
{
    private readonly LibrestackDbContext _db;

    public BookTagService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<List<BookTag>> GetAllTags(string userId)
    {
        var tags = await _db.BookTags.Where(l => l.UserId == userId || l.UserId == null).OrderBy(l => l.Id).ToListAsync();
        return tags;
    }

    public async Task<List<BookTag>> GetAllUserTags(string userId)
    {
        return await _db.BookTags.Where(l => l.UserId == userId).OrderBy(l => l.Id).ToListAsync();
    }

    public async Task<BookTag?> GetUserTag(string userId, int id)
    {
        var tag = await _db.BookTags.FirstOrDefaultAsync(l => l.UserId == userId && l.Id == id);
        if (tag is null)
            return null;

        return tag;
    }


    public async Task<bool> UpdateUserTag(string userId, BookTag bookTag)
    {
        var existingTag = await _db.BookTags.FirstOrDefaultAsync(l => l.Id == bookTag.Id && l.UserId == userId);
        if (existingTag is null)
            return false;
        existingTag.Tag = bookTag.Tag;

        _db.BookTags.Update(existingTag);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserTag(string userId, int id)
    {
        var tagEntry = await _db.BookTags.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (tagEntry is null)
            return false;

        _db.BookTags.Remove(tagEntry);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CreateUserTag(string userId, BookTag bookTag)
    {
        if (string.IsNullOrWhiteSpace(userId) || bookTag is null)
            return false;

        bookTag.UserId = userId;
        await _db.BookTags.AddAsync(bookTag);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApplyTag(string userId, int bookId, int tagId)
    {
        var tagToApply = await _db.BookTags.FirstOrDefaultAsync(l => l.Id == tagId);
        Console.WriteLine(tagToApply);
        if (tagToApply is null)
            return false;

        var bookEntry = await _db.Books.FirstOrDefaultAsync(l => l.Id == bookId && l.UserId == userId);
        Console.WriteLine(bookEntry);
        if (bookEntry is null)
            return false;

        bookEntry.BookTags.Add(tagToApply);
        await _db.SaveChangesAsync();
        return true;
    }
}
