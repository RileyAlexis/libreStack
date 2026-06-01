using Librestack.Models.APIModels;
namespace Librestack.Services;

public interface IReadingProgressService
{
    Task<bool> UpdateProgress(int libraryId, string userId, APIReadingProgress readingProgress);
    Task<bool> ResetProgress(int libraryId, string userId);
}