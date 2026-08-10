using Librestack.Models;

namespace Librestack.Interfaces;

public interface ICollectionsService
{
    Task<Result<List<Collections>>> GetAllUserCollections(string userId);
    Task<Result<Collections>> CreateCollection(string userId, string collectionTitle);
    Task<Result<Collections>> UpdateCollection(string userId, Collections updatedCollection);
    Task<Result> DeleteCollection(string userId, int collectionId);
    Task<Result> AddBookToCollection(string userId, int bookId, int collectionId);
    Task<Result> RemoveBookFromCollection(string userId, int bookId, int collectionId);
}