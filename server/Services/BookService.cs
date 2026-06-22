using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;

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

    public async Task<Result> AddBookEntry(IFormFile file, string userId, int libraryId)
    {
        if (file is null || file.Length == 0)
            return Result.Failure("File not found", ErrorType.NotFound);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".epub")
            return Result.Failure("LibreStack currently only supports epub files", ErrorType.BadRequest);

        var library = await _db.Libraries
            .Include(l => l.Books)
            .FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        if (library is null)
            return Result.Failure("Library not found", ErrorType.NotFound);

        var LibraryStoragePath = library.LibraryPath;

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

        return Result.Success();
    }

    public async Task<Result> DeleteBookEntry(int id, string userId)
    {
        var bookEntry = await _db.Books
            .Include(b => b.Libraries)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (bookEntry is null)
            return Result.Failure("Book id not found", ErrorType.NotFound);

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
        return Result.Success();
    }

    public async Task<Result<(Stream, string)>> DownloadBookEntry(string userId, int id)
    {
        var bookEntry = await _db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (bookEntry is null)
            return Result<(Stream, string)>.Failure("Book not found", ErrorType.NotFound);

        var filePath = bookEntry.EpubPath;
        if (filePath is null || !File.Exists(filePath))
            return Result<(Stream, string)>.Failure("File not found on disk", ErrorType.NotFound);

        var stream = File.OpenRead(filePath);
        return Result<(Stream, string)>.Success((stream, Path.GetFileName(filePath)));
    }


    public async Task<Result<List<Book>>> GetUserBooks(string userId)
    {
        var result = await _db.Books.Where(l => l.UserId == userId)
            .Include(l => l.BookTags)
            .Include(l => l.ReadingProgress)
            .Include(l => l.Bookmarks)
            .ToListAsync();

        if (result is null)
            return Result<List<Book>>.Failure("No books found for user", ErrorType.NotFound);

        return Result<List<Book>>.Success(result);
    }

    public async Task<Result<Book>> GetBookEntry(int id, string userId)
    {
        var result = await _db.Books.Where(l => l.UserId == userId && l.Id == id)
            .Include(l => l.BookTags)
            .Include(l => l.Bookmarks)
            .Include(l => l.ReadingProgress)
            .FirstOrDefaultAsync();

        if (result is null)
            return Result<Book>.Failure("Book not found", ErrorType.NotFound);

        return Result<Book>.Success(result);
    }

    public async Task<Result> UpdateBookMetaData(ApiBook book, string userId)
    {
        var existing = await _db.Books.FirstOrDefaultAsync(l => l.Id == book.Id && l.UserId == userId);
        if (existing is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

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
        if (book.CollectionId.HasValue && book.CollectionId != 0)
            existing.CollectionId = book.CollectionId;

        _db.Books.Update(existing);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> AddBookEntryFromPath(string filePath, string userId, int libraryId)
    {
        var library = await _db.Libraries
        .Include(l => l.Books)
        .FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);

        if (library is null)
            return Result.Failure("Library not found", ErrorType.NotFound);

        Book entry;
        try
        {
            entry = await _epubParser.ParseMetadata(filePath, userId);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to parse epub: {ex.Message}", ErrorType.BadRequest);
        }

        _db.Books.Add(entry);
        library.Books.Add(entry);
        await _db.SaveChangesAsync();

        return Result.Success();
    }
}