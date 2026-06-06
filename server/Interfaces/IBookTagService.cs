using Librestack.Models;

namespace Librestack.Interfaces;

public interface IBookTagService
{
    Task<List<BookTag>> GetAllTags(string userId);
    Task<List<BookTag>> GetAllUserTags(string userId);
    Task<BookTag?> GetUserTag(string userId, int id);
    Task<bool> UpdateUserTag(string userId, BookTag bookTag);
    Task<bool> DeleteUserTag(string userId, int id);
    Task<bool> CreateUserTag(string userId, BookTag b);
    Task<bool> ApplyTag(string userId, int bookId, int tagId);
}