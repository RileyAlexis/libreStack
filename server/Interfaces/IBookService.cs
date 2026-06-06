using Librestack.Models.APIModels;
using Librestack.Models;
using Microsoft.AspNetCore.Mvc;
namespace Librestack.Interfaces;

public interface IBookService
{
    Task<List<Book>> GetUserBooks(string userId);
    Task<Book?> GetBookEntry(int id, string userId);
    Task<bool> UpdateBookMetaData(ApiBook book, string userId);
    Task<bool> DeleteBookEntry(int id, string userId);
    Task<bool> AddBookEntry(IFormFile file, string UserId);
    Task<FileResult?> DownloadBookEntry(string userId, int id);
    Task<List<Book>> GetAllBooks();
}