using Librestack.Models;

namespace Librestack.Interfaces;

public interface IEpubParseService
{
    Task<Book> ParseMetadata(string filePath, string UserId);
}