using Librestack.Models;
using Librestack.Models.APIModels;

namespace Librestack.Interfaces;

public interface ISeriesService
{
    Task<Series> ResolveOrCreateSeriesAsync(string normalizedTitle, string userId);
    Task<Result<List<ApiSeries>>> GetUserSeries(string userId);
    Task<Result<List<ApiSeries>>> GetSeriesByLibrary(int libraryId, string userId);
    Task<Result<ApiSeries>> UpdateSeries(ApiSeries apiSeries, string userId);
    Task<Result<ApiSeries>> CreateNewSeries(ApiSeries apiSeries, string userId);
    Task<Result> DeleteSeries(int seriesId, string userId);
    Task<Result> ReassignSeries(int bookId, string userId, int seriesId);
}