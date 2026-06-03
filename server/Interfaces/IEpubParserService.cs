using Librestack.Models;

namespace Librestack.Interfaces;

public interface IEpubParseService
{
    Task<Library> ParseMetadata(string filePath, string UserId);
}