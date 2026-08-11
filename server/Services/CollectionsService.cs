using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class CollectionsService : ICollectionsService
{
    private readonly LibrestackDbContext _db;

    public CollectionsService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Result> AddBookToCollection(string userId, int bookId, int collectionId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var collection = await _db.Collections.FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);
        if (collection is null)
            return Result.Failure("Collection not found", ErrorType.NotFound);

        var book = await _db.Books.FirstOrDefaultAsync(b => b.UserId == userId && b.Id == bookId);
        if (book is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        book.Collections.Add(collection);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> RemoveBookFromCollection(string userId, int bookId, int collectionId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var collection = await _db.Collections.FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);
        if (collection is null)
            return Result.Failure("Collection not found", ErrorType.NotFound);

        var book = await _db.Books.Include(b => b.Collections).FirstOrDefaultAsync(b => b.UserId == userId && b.Id == bookId);
        if (book is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        book.Collections.Remove(collection);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<Collections>> CreateCollection(string userId, string collectionTitle)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<Collections>.Failure("User Id is required", ErrorType.BadRequest);

        if (string.IsNullOrEmpty(collectionTitle))
            return Result<Collections>.Failure("Collection Title is Required", ErrorType.BadRequest);

        var newCollection = new Collections
        {
            CollectionTitle = collectionTitle,
            UserId = userId
        };

        await _db.Collections.AddAsync(newCollection);
        await _db.SaveChangesAsync();
        return Result<Collections>.Success(newCollection);
    }

    public async Task<Result> DeleteCollection(string userId, int collectionId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var collectionEntry = await _db.Collections.FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);
        if (collectionEntry is null)
            return Result.Failure("Collection Id not found", ErrorType.NotFound);

        _db.Collections.Remove(collectionEntry);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<List<Collections>>> GetAllUserCollections(string userId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<List<Collections>>.Failure("User Id is required", ErrorType.BadRequest);

        var collectionEntries = await _db.Collections.Where(c => c.UserId == userId).ToListAsync();

        if (collectionEntries is null)
            return Result<List<Collections>>.Failure("No Collections Found", ErrorType.NotFound);

        return Result<List<Collections>>.Success(collectionEntries);
    }

    public async Task<Result<List<Collections>>> GetCollectionsByLibrary(string userId, int libraryId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<List<Collections>>.Failure("User Id is required", ErrorType.BadRequest);

        var library = await _db.Libraries
            .Include(l => l.Books)
            .ThenInclude(b => b.Collections)
            .FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);

        if (library is null)
            return Result<List<Collections>>.Failure("Library not found", ErrorType.NotFound);

        var collections = library.Books
            .SelectMany(b => b.Collections)
            .DistinctBy(c => c.Id)
            .ToList();

        return Result<List<Collections>>.Success(collections);
    }

    public async Task<Result<Collections>> UpdateCollection(string userId, Collections updatedCollection)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result<Collections>.Failure("User Id is required", ErrorType.BadRequest);

        var existingCollection = await _db.Collections.FirstOrDefaultAsync(c => c.Id == updatedCollection.Id && c.UserId == userId);
        if (existingCollection is null)
            return Result<Collections>.Failure("Collection not Found", ErrorType.NotFound);

        existingCollection.CollectionTitle = updatedCollection.CollectionTitle;
        existingCollection.CollectionCover = updatedCollection.CollectionCover;

        _db.Collections.Update(existingCollection);
        await _db.SaveChangesAsync();
        return Result<Collections>.Success(existingCollection);
    }
}