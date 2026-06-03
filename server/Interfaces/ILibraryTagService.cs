using Librestack.Models;

namespace Librestack.Interfaces;

public interface ILibraryTagService
{
    Task<List<LibraryTag>> GetAllTags(string userId);
    Task<List<LibraryTag>> GetAllUserTags(string userId);
    Task<LibraryTag?> GetUserTag(string userId, int id);
    Task<bool> UpdateUserTag(string userId, LibraryTag libraryTag);
    Task<bool> DeleteUserTag(string userId, int id);
    Task<bool> CreateUserTag(string userId, LibraryTag libraryTag);
    Task<bool> ApplyTag(string userId, int libraryId, int tagId);
}