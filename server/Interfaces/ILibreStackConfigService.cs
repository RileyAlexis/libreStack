using Librestack.Models;

namespace Librestack.Interfaces;

public interface ILibreStackConfigService
{
    Task<Result> MarkSetupAsComplete(bool isComplete);
    Task<Result<LibreStackConfig>> GetConfigData();
    Task<Result> SaveConfig(LibreStackConfig config);
    Task<bool> CheckIfSetupComplete();
}