using Librestack.Models.APIModels;
using Librestack.Models;
namespace Librestack.Services;

public interface InterfaceLibraryService
{
    Task<List<Library>> GetLibrary(string userId);
    Task<Library?> GetLibraryEntry(int id, string userId);
    Task<bool> UpdateLibraryMetaData(APILibrary library, string userId);
    Task<bool> DeleteLibraryEntry(int id, string userId);
    Task<bool> AddLibraryEntry(IFormFile file, string UserId);
}