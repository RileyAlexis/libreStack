using Librestack.Models;

namespace Librestack.Interfaces;

public interface ISeriesService
{
    Task<Series> ResolveOrCreateSeriesAsync(string normalizedTitle);
}