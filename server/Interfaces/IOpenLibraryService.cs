using Librestack.Models;
namespace Librestack.Interfaces;

public interface IOpenLibraryService
{
    Task<Result> QueryOpenLibrary(string userId, int bookId);
    Task<Result> RefreshOpenLibrarydata(string userId, int libraryId);
}