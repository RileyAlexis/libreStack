using Librestack.Models;
using Librestack.Models.APIModels;
namespace Librestack.Interfaces;

public interface IBookmarkService
{
    Task<Result> CreateBookmark(int bookId, string userId, ApiBookmarkModel ApiBbookmarkModel);
    Task<Result> DeleteBookmark(int id, string userId);
    Task<Result> UpdateBookmark(int id, string userId, ApiBookmarkModel apiBookmarkModel);
    Task<Result<List<BookmarkModel>>> GetBookmarksByBookId(string userId, int bookId);
}