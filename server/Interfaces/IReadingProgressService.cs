using Librestack.Models.APIModels;
namespace Librestack.Interfaces;

public interface IReadingProgressService
{
    Task<bool> UpdateProgress(string userId, APIReadingProgress readingProgress);
    Task<bool> ResetProgress(int bookId, string userId);
}