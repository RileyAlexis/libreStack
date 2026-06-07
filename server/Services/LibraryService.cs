using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Services;

public class LibraryService : ILibraryService
{
    private readonly LibrestackDbContext _db;

    public LibraryService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Result> AddBookToLibrary(string userId, int libraryId, int bookId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("UserId not found or is incorrect", ErrorType.NotFound);

        var book = await _db.Books.FirstOrDefaultAsync(l => l.Id == bookId && l.UserId == userId);
        if (book is null) return Result.Failure("Book Id not found", ErrorType.NotFound);
        var library = await _db.Libraries
            .Include(l => l.Books)
            .FirstOrDefaultAsync(l => l.Id == libraryId);
        if (library is null) return Result.Failure("Library Id not found", ErrorType.NotFound);


        if (library.Books.Any(b => b.Id == bookId))
            return Result.Failure("Book is already in this library", ErrorType.Conflict);

        library.Books.Add(book);
        await _db.SaveChangesAsync();
        return Result.Success();
    }


    public async Task<Result<Library>> CreateLibrary(string userId, Library library)
    {
        if (string.IsNullOrWhiteSpace(userId) || library is null)
            return Result<Library>.Failure("User Id and library are required", ErrorType.BadRequest);

        library.UserId = userId;
        await _db.Libraries.AddAsync(library);
        await _db.SaveChangesAsync();
        return Result<Library>.Success(library);
    }

    public async Task<Result> DeleteLibrary(string userId, int libraryId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var library = await _db.Libraries
                .Include(l => l.Books)
                .FirstOrDefaultAsync(l => l.UserId == userId && l.Id == libraryId);

        if (library is null)
            return Result.Failure("Library Not Found", ErrorType.NotFound);

        if (library.Books.Any())
            return Result.Failure("Library that contains any books cannot be deleted", ErrorType.BadRequest);

        var allLibs = await _db.Libraries.Where(l => l.UserId == userId).ToListAsync();
        if (allLibs.Count < 2)
            return Result.Failure("Cannot delete only library for user", ErrorType.BadRequest);

        _db.Libraries.Remove(library);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<List<Library>>> GetAllLibraries(string userId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<List<Library>>.Failure("User Id is required", ErrorType.BadRequest);
        var libraries = await _db.Libraries
            .Where(l => l.UserId == userId)
            .Include(l => l.Books)
                .ThenInclude(b => b.BookTags)
            .Include(l => l.Books)
                .ThenInclude(b => b.ReadingProgress)
            .Include(l => l.Books)
                .ThenInclude(b => b.Bookmarks)
            .ToListAsync();

        if (libraries.Count == 0)
            return Result<List<Library>>.Failure("Library not found", ErrorType.NotFound);

        return Result<List<Library>>.Success(libraries);
    }

    public async Task<Result<Library>> GetLibrary(string userId, int id)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<Library>.Failure("User Id is required", ErrorType.BadRequest);
        var result = await _db.Libraries
            .Include(l => l.Books)
                .ThenInclude(b => b.BookTags)
            .Include(l => l.Books)
                .ThenInclude(b => b.ReadingProgress)
            .Include(l => l.Books)
                .ThenInclude(b => b.Bookmarks)
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Id == id);

        return result is null
            ? Result<Library>.Failure("Library not found", ErrorType.NotFound)
            : Result<Library>.Success(result);
    }

    public async Task<Result> RemoveBookFromLibrary(string userId, int libraryId, int bookId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var book = await _db.Books.FirstOrDefaultAsync(b => b.UserId == userId && b.Id == bookId);
        if (book is null)
            return Result.Failure("Book Not Found", ErrorType.NotFound);

        var librariesContainingBook = await _db.Libraries
            .Where(l => l.Books.Any(b => b.Id == bookId))
            .ToListAsync();

        if (librariesContainingBook.Count == 0)
            return Result.Failure("Book is not associated with any libraries", ErrorType.NotFound);

        var library = await _db.Libraries
            .Include(l => l.Books)
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Id == libraryId);

        if (library is null)
            return Result.Failure("Library Not Found", ErrorType.NotFound);

        var bookInLibrary = library.Books.FirstOrDefault(b => b.Id == bookId);
        if (bookInLibrary is null)
            return Result.Failure("Book not found in the specified library", ErrorType.NotFound);

        if (librariesContainingBook.Count == 1)
            return Result.Failure("Book is only in one library and cannot be removed", ErrorType.Conflict);

        library.Books.Remove(bookInLibrary);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> UpdateLibrary(string userId, int libraryId, Library library)
    {
        var existing = await _db.Libraries.FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        if (library is null)
            return Result.Failure("Library not found", ErrorType.NotFound);

        existing = library;
        _db.Libraries.Update(existing);
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}