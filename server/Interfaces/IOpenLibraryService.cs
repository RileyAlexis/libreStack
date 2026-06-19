using Librestack.Models;
namespace Librestack.Interfaces;

public interface IOpenLibraryService
{
    Task<Result> QueryOpenLibrary(string userId, int bookId);
}