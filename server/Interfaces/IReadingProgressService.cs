using Librestack.Models.APIModels;
namespace Librestack.Interfaces;

public interface IReadingProgressService
{
    Task<bool> UpdateProgress(int bookId, string userId, APIReadingProgress readingProgress);
    Task<bool> ResetProgress(int bookId, string userId);
}