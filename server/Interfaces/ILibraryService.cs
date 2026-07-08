using Librestack.Models;
namespace Librestack.Interfaces;

public interface ILibraryService
{
    Task<Result<Library>> CreateLibrary(string userId, Library library);
    Task<Result<List<Library>>> GetAllLibraries(string userId);
    Task<Result<Library>> GetLibrary(string userId, int id);
    Task<Result> UpdateLibrary(string userId, int libraryId, string libraryName, string libraryPath);
    Task<Result> AddBookToLibrary(string userId, int libraryId, int bookId);
    Task<Result> RemoveBookFromLibrary(string userId, int libraryId, int bookId);
    Task<Result> DeleteLibrary(string userId, int libraryId);
}