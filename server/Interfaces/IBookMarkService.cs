using Librestack.Models;
using Librestack.Models.APIModels;
namespace Librestack.Interfaces;

public interface IBookmarkService
{
    Task<Result<BookmarkModel>> CreateBookmark(int bookId, string userId, ApiBookmarkModel ApiBbookmarkModel);
    Task<Result<BookmarkModel>> DeleteBookmark(int id, string userId);
    Task<Result> UpdateBookmark(string userId, ApiBookmarkModel apiBookmarkModel);
    Task<Result<List<BookmarkModel>>> GetBookmarksByBookId(string userId, int bookId);
}