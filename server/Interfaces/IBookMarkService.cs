using Librestack.Models;
using Librestack.Models.APIModels;
namespace Librestack.Services;

public interface IBookmarkService
{
    Task<bool> CreateBookmark(int libraryId, string userId, ApiBookmarkModel ApiBbookmarkModel);
    Task<bool> DeleteBookmark(int id, string userId);
    Task<bool> UpdateBookmark(int id, string userId, ApiBookmarkModel apiBookmarkModel);
}