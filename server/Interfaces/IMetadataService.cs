using Librestack.Models;
namespace Librestack.Interfaces;

public interface IMetadataService
{
    Task<Result> DownloadMetadata(string userId, int bookId, int serviceId);
}