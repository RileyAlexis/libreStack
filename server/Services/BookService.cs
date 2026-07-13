using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;
using SkiaSharp;

namespace Librestack.Services;

public class BookService : IBookService
{
    private readonly LibrestackDbContext _db;
    private readonly IEpubParseService _epubParser;
    private readonly ISeriesService _iSeriesService;

    public BookService(LibrestackDbContext db, IEpubParseService epubParser, ISeriesService seriesService)
    {
        _db = db;
        _epubParser = epubParser;
        _iSeriesService = seriesService;
    }

    private static byte[]? ResizeBookCover(byte[]? cover)
    {
        if (cover is null || cover.Length == 0)
            return cover;

        using var bitmap = SKBitmap.Decode(cover);

        if (bitmap.Height <= 750)
            return cover;

        var ratio = 500f / bitmap.Height;
        var newWidth = (int)(bitmap.Width * ratio);

        using var resized = bitmap.Resize(new SKImageInfo(newWidth, 500), SKSamplingOptions.Default);
        using var image = SKImage.FromBitmap(resized);
        using var data = image.Encode(SKEncodedImageFormat.Jpeg, 85);
        return data.ToArray();
    }

    public async Task<Result> AddBookEntry(IFormFile file, string userId, int libraryId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        if (file is null || file.Length == 0)
            return Result.Failure("File not found", ErrorType.NotFound);

        var config = await _db.LibreStackConfig.FirstOrDefaultAsync();

        if (!config!.AllowUploadToLibrary)
        {
            return Result.Failure("Server does not allow uploading of new books", ErrorType.Forbidden);
        }

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

        var resizedCover = ResizeBookCover(entry.CoverImage);
        entry.CoverImage = resizedCover;

        _db.Books.Add(entry);
        library.Books.Add(entry);
        await _db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> DeleteBookEntry(int id, string userId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var bookEntry = await _db.Books
            .Include(b => b.Libraries)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (bookEntry is null)
            return Result.Failure("Book id not found", ErrorType.NotFound);

        var config = await _db.LibreStackConfig.FirstOrDefaultAsync();

        if (!config!.AllowRemoveBooksFromLibrary)
            return Result.Failure("Server settings do not allow removing books from library", ErrorType.Forbidden);

        var filePath = bookEntry.EpubPath;
        if (filePath is not null && File.Exists(filePath) && config!.AllowDeleteFromDisk)
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
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<(Stream, string)>.Failure("User Id is required", ErrorType.BadRequest);

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
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<List<Book>>.Failure("User Id is required", ErrorType.BadRequest);

        var result = await _db.Books.Where(l => l.UserId == userId)
            .Include(l => l.BookTags)
            .Include(l => l.ReadingProgress)
            .Include(l => l.Bookmarks)
            .Include(l => l.Series)
            .ToListAsync();

        if (result is null)
            return Result<List<Book>>.Failure("No books found for user", ErrorType.NotFound);

        return Result<List<Book>>.Success(result);
    }

    public async Task<Result<Book>> GetBookEntry(int id, string userId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<Book>.Failure("User Id is required", ErrorType.BadRequest);

        var result = await _db.Books.Where(l => l.UserId == userId && l.Id == id)
            .Include(l => l.BookTags)
            .Include(l => l.Bookmarks)
            .Include(l => l.ReadingProgress)
            .Include(l => l.Series)
            .FirstOrDefaultAsync();

        if (result is null)
            return Result<Book>.Failure("Book not found", ErrorType.NotFound);

        return Result<Book>.Success(result);
    }

    public async Task<Result<ApiBook>> UpdateBookMetaData(ApiBook book, string userId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<ApiBook>.Failure("User Id is required", ErrorType.BadRequest);

        var existing = await _db.Books
            .Include(l => l.Series)
            .FirstOrDefaultAsync(l => l.Id == book.Id && l.UserId == userId);

        if (existing is null)
            return Result<ApiBook>.Failure("Book not found", ErrorType.NotFound);

        existing.Title = book.Title;
        existing.Author = book.Author;
        existing.Publisher = book.Publisher;
        existing.SeriesOrder = book.SeriesOrder;
        existing.ISBN = book.ISBN;
        existing.LCCN = book.LCCN;
        existing.OCLCWorldCat = book.OCLCWorldCat;
        existing.CollectionId = book.CollectionId;
        existing.OpenLibraryAuthorId = book.OpenLibraryAuthorId;
        existing.OpenLibraryEditionId = book.OpenLibraryEditionId;
        existing.OpenLibraryWorkId = book.OpenLibraryWorkId;
        existing.OpenLibraryCoverId = book.OpenLibraryCoverId;
        existing.WikidataId = book.WikidataId;
        existing.Description = book.Description;

        if (book.Series is not null && !string.IsNullOrWhiteSpace(book.Series.SeriesTitle))
        {
            var resolvedSeries = await _iSeriesService.ResolveOrCreateSeriesAsync(
                book.Series.SeriesTitle.Trim(), userId);
            existing.SeriesId = resolvedSeries.Id;
            existing.Series = resolvedSeries;
        }
        else
        {
            existing.SeriesId = null;
            existing.Series = null;
        }

        await _db.SaveChangesAsync();

        var updated = new ApiBook
        {
            Id = existing.Id,
            Title = existing.Title,
            Author = existing.Author,
            Publisher = existing.Publisher,
            Description = existing.Description,
            SeriesOrder = existing.SeriesOrder,
            ISBN = existing.ISBN,
            ISBN13 = existing.ISBN13,
            LCCN = existing.LCCN,
            OCLCWorldCat = existing.OCLCWorldCat,
            OpenLibraryWorkId = existing.OpenLibraryWorkId,
            OpenLibraryEditionId = existing.OpenLibraryEditionId,
            OpenLibraryAuthorId = existing.OpenLibraryAuthorId,
            OpenLibraryCoverId = existing.OpenLibraryCoverId,
            WikidataId = existing.WikidataId,
            Language = existing.Language,
            CollectionId = existing.CollectionId,
            Series = existing.Series is null
                ? null
                : new ApiSeries
                {
                    Id = existing.Series.Id,
                    SeriesTitle = existing.Series.SeriesTitle!,
                    SeriesTotal = existing.Series.SeriesTotal
                }
        };

        return Result<ApiBook>.Success(updated);
    }

    public async Task<Result> AddBookEntryFromPath(string filePath, string userId, int libraryId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

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

        var resizedCover = ResizeBookCover(entry.CoverImage);
        entry.CoverImage = resizedCover;

        _db.Books.Add(entry);
        library.Books.Add(entry);
        await _db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<List<Book>>> GetBooksBySeries(int seriesId, string userId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<List<Book>>.Failure("User Id is required", ErrorType.BadRequest);

        var response = await _db.Books.Where(b => b.SeriesId == seriesId && b.UserId == userId).ToListAsync();

        if (response is null)
            return Result<List<Book>>.Failure("No books found in series", ErrorType.NotFound);

        return Result<List<Book>>.Success(response);
    }
}