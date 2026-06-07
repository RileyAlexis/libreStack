using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Services;

public class BookService : IBookService
{
    private readonly LibrestackDbContext _db;
    private readonly IEpubParseService _epubParser;

    public BookService(LibrestackDbContext db, IEpubParseService epubParser)
    {
        _db = db;
        _epubParser = epubParser;
    }

    public async Task<bool> AddBookEntry(IFormFile file, string userId, int libraryId)
    {
        var LibraryStoragePath = "./Library";

        if (file is null || file.Length == 0)
            return false;

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".epub")
            return false;

        var library = await _db.Libraries
            .Include(l => l.Books)
            .FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        if (library is null)
            return false;

        Directory.CreateDirectory(LibraryStoragePath);

        var fileName = file.FileName;
        var filePath = Path.Combine(LibraryStoragePath, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        Book entry;
        try
        {
            entry = await _epubParser.ParseMetadata(filePath, userId);
        }
        catch
        {
            File.Delete(filePath);
            throw;
        }

        _db.Books.Add(entry);
        library.Books.Add(entry);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteBookEntry(int id, string userId)
    {
        var bookEntry = await _db.Books
            .Include(b => b.Libraries)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (bookEntry is null)
            return false;

        var filePath = bookEntry.EpubPath;
        if (filePath is not null && File.Exists(filePath))
            File.Delete(filePath);

        if (bookEntry.Libraries is not null)
        {
            foreach (var library in bookEntry.Libraries.ToList())
            {
                library.Books.Remove(bookEntry);
            }
            bookEntry.Libraries.Clear();
        }

        _db.Books.Remove(bookEntry);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<FileResult?> DownloadBookEntry(string userId, int id)
    {
        var bookEntry = await _db.Books.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (bookEntry is null)
            return null;
        var filePath = bookEntry.EpubPath;
        var filename = Path.GetFileName(filePath);

        if (!System.IO.File.Exists(filePath.ToString()))
            return null;

        var stream = System.IO.File.OpenRead(filePath.ToString());
        return new FileStreamResult(stream, "application/octet-stream")
        {
            FileDownloadName = filename
        };

    }

    public async Task<List<Book>> GetAllBooks()
    {
        return await _db.Books
        .Include(l => l.BookTags)
        .Include(l => l.Bookmarks)
        .Include(l => l.ReadingProgress)
        .ToListAsync();
    }

    public async Task<List<Book>> GetUserBooks(string userId)
    {
        return await _db.Books.Where(l => l.UserId == userId)
            .Include(l => l.BookTags)
            .Include(l => l.ReadingProgress)
            .Include(l => l.Bookmarks)
            .ToListAsync();
    }

    public async Task<Book?> GetBookEntry(int id, string userId)
    {
        var result = await _db.Books.Where(l => l.UserId == userId && l.Id == id)
            .Include(l => l.BookTags)
            .Include(l => l.Bookmarks)
            .Include(l => l.ReadingProgress)
            .FirstOrDefaultAsync();

        if (result is null)
            return null;

        return result;
    }

    public async Task<bool> UpdateBookMetaData(ApiBook book, string userId)
    {
        var existing = await _db.Books.FirstOrDefaultAsync(l => l.Id == book.Id && l.UserId == userId);
        if (existing is null)
            return false;

        // Only update properties that were provided (not null/default)
        if (!string.IsNullOrEmpty(book.Title))
            existing.Title = book.Title;
        if (!string.IsNullOrEmpty(book.Author))
            existing.Author = book.Author;
        if (!string.IsNullOrEmpty(book.Publisher))
            existing.Publisher = book.Publisher;
        if (book.SeriesTitle is not null)
            existing.SeriesTitle = book.SeriesTitle;
        if (book.SeriesOrder.HasValue && book.SeriesOrder != 0)
            existing.SeriesOrder = book.SeriesOrder;
        if (book.SeriesTotal.HasValue && book.SeriesTotal != 0)
            existing.SeriesTotal = book.SeriesTotal;
        if (!string.IsNullOrEmpty(book.ISBN))
            existing.ISBN = book.ISBN;
        if (book.LCCN is not null)
            existing.LCCN = book.LCCN;
        if (book.OCLCWorldCat is not null)
            existing.OCLCWorldCat = book.OCLCWorldCat;
        if (book.AmazonId is not null)
            existing.AmazonId = book.AmazonId;
        if (book.WorkId is not null)
            existing.WorkId = book.WorkId;
        if (book.CollectionId.HasValue && book.CollectionId != 0)
            existing.CollectionId = book.CollectionId;

        _db.Books.Update(existing);
        await _db.SaveChangesAsync();
        return true;
    }



}