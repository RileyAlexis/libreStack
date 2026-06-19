using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class LibraryScanService : IlibraryScanService
{
    private readonly LibrestackDbContext _db;
    private readonly IEpubParseService _epubParser;
    private readonly IBookService _bookService;

    public LibraryScanService(LibrestackDbContext db, IEpubParseService epubParser, IBookService bookService)
    {
        _db = db;
        _epubParser = epubParser;
        _bookService = bookService;
    }

    public async Task<Result> ScanLibraryFiles(string userId, int libraryId)
    {
        var library = await _db.Libraries
            .Include(l => l.Books)
            .FirstOrDefaultAsync(l => l.Id == libraryId);

        if (library is null) return Result.Failure("Library not found", ErrorType.NotFound);
        if (library.UserId != userId) return Result.Failure("Library not owned by user", ErrorType.Forbidden);
        var libraryPath = library.LibraryPath;
        if (!Directory.Exists(libraryPath))
            return Result.Failure("Library Path not found on disk", ErrorType.NotFound);

        var epubFiles = Directory.EnumerateFiles(libraryPath, "*.epub", SearchOption.AllDirectories);

        var existingPaths = library.Books
            .Select(b => b.EpubPath)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existingTitles = library.Books
            .Select(b => b.Title.Trim().ToLowerInvariant())
            .ToHashSet();

        var existingISBNs = library.Books
            .Where(b => !string.IsNullOrWhiteSpace(b.ISBN))
            .Select(b => b.ISBN!.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var errors = new List<string>();

        foreach (var filePath in epubFiles)
        {
            if (existingPaths.Contains(filePath))
                continue;

            Book parsed;
            try
            {
                parsed = await _epubParser.ParseMetadata(filePath, library.UserId);
            }
            catch (Exception ex)
            {
                errors.Add($"{Path.GetFileName(filePath)}: failed to parse — {ex.Message}");
                continue;
            }

            bool isbnMatch = !string.IsNullOrWhiteSpace(parsed.ISBN) && existingISBNs.Contains(parsed.ISBN.Trim());
            bool titleMatch = existingTitles.Contains(parsed.Title.Trim().ToLowerInvariant());

            if (isbnMatch || titleMatch)
                continue;

            var result = await _bookService.AddBookEntryFromPath(filePath, library.UserId, libraryId);
            if (!result.IsSuccess)
            {
                errors.Add($"{Path.GetFileName(filePath)}: {result.Error}");
                continue;
            }

            existingPaths.Add(filePath);
            existingTitles.Add(parsed.Title.Trim().ToLowerInvariant());
            if (!string.IsNullOrWhiteSpace(parsed.ISBN))
                existingISBNs.Add(parsed.ISBN.Trim());
        }

        return errors.Count == 0
            ? Result.Success()
            : Result.Failure($"Scan completed with errors: {string.Join("; ", errors)}", ErrorType.Unexpected);
    }
}