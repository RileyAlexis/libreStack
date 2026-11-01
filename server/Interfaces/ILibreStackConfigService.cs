using Librestack.Models;

namespace Librestack.Interfaces;

public record LibreStackSetup(bool IsSetupComplete, bool IsBasePathSet, bool IsAdminRegistered);

public interface ILibreStackConfigService
{
    Task<Result> MarkSetupAsComplete(bool isComplete);
    Task<Result<LibreStackConfig>> GetConfigData();
    Task<Result> SaveConfig(LibreStackConfig config);
    Task<Result> SetBasePath(string basePath);
    Task<Result<LibreStackSetup>> CheckIfSetupComplete();
}