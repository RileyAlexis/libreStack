using Librestack.Models;
namespace Librestack.Interfaces;

public interface IOpenLibraryService
{
    Task<Result> QueryOpenLibrary(string userId, int bookId);
    Task<Result> RefreshOpenLibrarydata(string userId, int libraryId);
    Task<Result> FetchBookCover(string userId, int bookId);
    Task<Result<List<BookSearchModel>>> SearchOpenLibrary(string userId, int bookId, string? searchTerm);
}