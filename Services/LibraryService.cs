using Librestack.Models;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;


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

    public async Task<bool> DeleteLibraryEntry(int id)
    {
        var libraryEntry = await _db.Library.FindAsync(id);
        if (libraryEntry is null)
            return false;

        var FilePath = libraryEntry.EpubPath;
        if (FilePath is not null && File.Exists(FilePath))
            File.Delete(FilePath);

        _db.Library.Remove(libraryEntry);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<Library>> GetLibrary()
    {
        return await _db.Library.ToListAsync();
    }

    public async Task<Library?> GetLibraryEntry(int id)
    {
        var result = await _db.Library.FindAsync(id);
        if (result is null)
            return null;

        return result;
    }

    public Task<bool> UpdateLibraryMetaData(Library library)
    {
        throw new NotImplementedException();
    }
}