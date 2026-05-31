using Librestack.Models;

namespace Librestack.Services;

public interface InterfaceLibraryTagService
{
    Task<List<LibraryTag>> GetAllTags(string userId);
    Task<List<LibraryTag>> GetAllUserTags(string userId);
    Task<bool> UpdateUserTag(string userId, LibraryTag libraryTag);
    Task<bool> DeleteUserTag(string userId, LibraryTag libraryTag);
    Task<bool> CreateUserTag(string userId, LibraryTag libraryTag);
    Task<bool> ApplyTag(string userId, int libraryTagId, int libraryId);
}