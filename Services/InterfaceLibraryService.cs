using Librestack.Models;
namespace Librestack.Services;

public interface InterfaceLibraryService
{
    Task<List<Library>> GetLibrary();
    Task<Library?> GetLibraryEntry(int id);
    Task<bool> UpdateLibraryMetaData(Library library);
    Task<bool> DeleteLibraryEntry(int id);
    Task<bool> AddLibraryEntry(IFormFile file, string UserId);
}