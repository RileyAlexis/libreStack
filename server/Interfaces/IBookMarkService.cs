using Librestack.Models.APIModels;
namespace Librestack.Interfaces;

public interface IBookmarkService
{
    Task<bool> CreateBookmark(int bookId, string userId, ApiBookmarkModel ApiBbookmarkModel);
    Task<bool> DeleteBookmark(int id, string userId);
    Task<bool> UpdateBookmark(int id, string userId, ApiBookmarkModel apiBookmarkModel);
}