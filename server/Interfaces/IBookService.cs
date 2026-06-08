using Librestack.Models.APIModels;
using Librestack.Models;
using Microsoft.AspNetCore.Mvc;
namespace Librestack.Interfaces;

public interface IBookService
{
    Task<Result<List<Book>>> GetUserBooks(string userId);
    Task<Result<Book>> GetBookEntry(int id, string userId);
    Task<Result> UpdateBookMetaData(ApiBook book, string userId);
    Task<Result> DeleteBookEntry(int id, string userId);
    Task<Result> AddBookEntry(IFormFile file, string UserId, int libraryId);
    Task<Result<FileStreamResult>> DownloadBookEntry(string userId, int id);
}