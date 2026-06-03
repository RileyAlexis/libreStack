using Librestack.Models;

namespace Librestack.Interfaces;

public interface ILibreStackConfigService
{
    Task<bool> UpdateLibraryPath(string path);
    Task<bool> MarkSetupAsComplete(bool isComplete);
    Task<List<LibreStackConfig>> GetConfigData();
    Task<bool> SaveConfig(LibreStackConfig config);
    Task<bool> CheckIfSetupComplete();
}