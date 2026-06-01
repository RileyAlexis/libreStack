using Librestack.Models;

namespace Librestack.Services;

public interface IEpubParseService
{
    Task<Library> ParseMetadata(string filePath, string UserId);
}