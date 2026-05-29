using Librestack.Models;

public interface IEpubParseService
{
    Task<Library> ParseMetadata(string filePath, string UserId);
}