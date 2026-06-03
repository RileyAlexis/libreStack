namespace Librestack.Interfaces;

public interface ILibreStackConfigService
{
    Task<bool> UpdateLibraryPath(string path);
    Task<bool> SetCompleteSetup(bool isComplete);
}