using Librestack.Models;

namespace Librestack.Interfaces;

public interface ISeriesService
{
    Task<Series> ResolveOrCreateSeriesAsync(string normalizedTitle, string userId);
    Task<Result> UpdateSeries(Series series);
    Task<Result> CreateNewSeries(Series series);
    Task<Result> DeleteSeries(Series series);
}