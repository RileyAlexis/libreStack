using Librestack.Models;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Services;

public class LibraryService : InterfaceLibraryService
{
    private readonly LibrestackDbContext _db;
    private readonly IEpubParseService _epubParser;

    public LibraryService(LibrestackDbContext db, IEpubParseService epubParser)
    {
        _db = db;
        _epubParser = epubParser;
    }

    public async Task<bool> AddLibraryEntry(IFormFile file, string UserId)
    {
        var LibraryStoragePath = "./Library";

        if (file is null || file.Length == 0)
            return false;

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".epub")
            return false;

        Directory.CreateDirectory(LibraryStoragePath);

        var fileName = file.FileName;
        var filePath = Path.Combine(LibraryStoragePath, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        Library entry;
        try
        {
            entry = await _epubParser.ParseMetadata(filePath, UserId);
        }
        catch
        {
            File.Delete(filePath);
            throw;
        }

        _db.Library.Add(entry);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteLibraryEntry(int id, string userId)
    {
        var libraryEntry = await _db.Library.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (libraryEntry is null)
            return false;

        var FilePath = libraryEntry.EpubPath;
        if (FilePath is not null && File.Exists(FilePath))
            File.Delete(FilePath);

        _db.Library.Remove(libraryEntry);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<FileResult?> DownloadLibraryEntry(string userId, int id)
    {
        var libraryEntry = await _db.Library.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (libraryEntry is null)
            return null;
        var filePath = libraryEntry.EpubPath;
        var filename = Path.GetFileName(filePath);

        if (!System.IO.File.Exists(filePath.ToString()))
            return null;

        var stream = System.IO.File.OpenRead(filePath.ToString());
        return new FileStreamResult(stream, "application/octet-stream")
        {
            FileDownloadName = filename
        };

    }

    public async Task<List<Library>> GetLibrary(string userId)
    {
        return await _db.Library.Where(l => l.UserId == userId)
            .Include(l => l.LibraryTags)
            .Include(l => l.ReadingProgress)
            .ToListAsync();
    }

    public async Task<Library?> GetLibraryEntry(int id, string userId)
    {
        var result = await _db.Library.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (result is null)
            return null;

        return result;
    }

    public async Task<bool> UpdateLibraryMetaData(APILibrary library, string userId)
    {
        var existing = await _db.Library.FirstOrDefaultAsync(l => l.Id == library.Id && l.UserId == userId);
        if (existing is null)
            return false;

        // Only update properties that were provided (not null/default)
        if (!string.IsNullOrEmpty(library.Title))
            existing.Title = library.Title;
        if (!string.IsNullOrEmpty(library.Author))
            existing.Author = library.Author;
        if (!string.IsNullOrEmpty(library.Publisher))
            existing.Publisher = library.Publisher;
        if (library.SeriesTitle is not null)
            existing.SeriesTitle = library.SeriesTitle;
        if (library.SeriesOrder.HasValue && library.SeriesOrder != 0)
            existing.SeriesOrder = library.SeriesOrder;
        if (library.SeriesTotal.HasValue && library.SeriesTotal != 0)
            existing.SeriesTotal = library.SeriesTotal;
        if (!string.IsNullOrEmpty(library.ISBN))
            existing.ISBN = library.ISBN;
        if (library.LCCN is not null)
            existing.LCCN = library.LCCN;
        if (library.OCLCWorldCat is not null)
            existing.OCLCWorldCat = library.OCLCWorldCat;
        if (library.AmazonId is not null)
            existing.AmazonId = library.AmazonId;
        if (library.WorkId is not null)
            existing.WorkId = library.WorkId;
        if (library.CollectionId.HasValue && library.CollectionId != 0)
            existing.CollectionId = library.CollectionId;

        _db.Library.Update(existing);
        await _db.SaveChangesAsync();
        return true;
    }



}