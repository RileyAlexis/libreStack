using Librestack.Models.APIModels;
using Librestack.Models;
namespace Librestack.Interfaces;

public interface IBookService
{
    Task<Result<List<Book>>> GetBooksByLibrary(string userId, int libraryId);
    Task<Result<Book>> GetBookEntry(int id, string userId);
    Task<Result<List<Book>>> GetBooksBySeries(int seriesId, string userId);
    Task<Result<ApiBook>> UpdateBookMetaData(ApiBook book, string userId);
    Task<Result> DeleteBookEntry(int id, string userId);
    Task<Result> AddBookEntry(IFormFile file, string UserId, int libraryId);
    Task<Result> AddBookEntryFromPath(string filePath, string userId, int libraryId);
    Task<Result<(Stream, string)>> DownloadBookEntry(string userId, int id);
}