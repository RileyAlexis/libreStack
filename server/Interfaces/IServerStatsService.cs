using Librestack.Models;

namespace Librestack.Interfaces;

public interface IServerStatsService
{
    Task<Result<ServerStats>> GetServerStats();
}