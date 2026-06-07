using Librestack.Models;

namespace Librestack.Interfaces;

public interface ILibreStackConfigService
{
    Task<Result> MarkSetupAsComplete(bool isComplete);
    Task<List<LibreStackConfig>> GetConfigData();
    Task<bool> SaveConfig(LibreStackConfig config);
    Task<bool> CheckIfSetupComplete();
}