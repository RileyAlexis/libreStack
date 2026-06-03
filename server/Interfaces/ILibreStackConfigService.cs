using Librestack.Models;

namespace Librestack.Interfaces;

public interface ILibreStackConfigService
{
    Task<bool> UpdateLibraryPath(string path);
    Task<bool> SetCompleteSetup(bool isComplete);
    Task<List<LibreStackConfig>> GetConfigData();
    void SaveConfig(LibreStackConfig config);
}