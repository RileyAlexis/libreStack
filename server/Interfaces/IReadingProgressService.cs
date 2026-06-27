using Librestack.Models.APIModels;
using Librestack.Models;

namespace Librestack.Interfaces;

public interface IReadingProgressService
{
    Task<Result> UpdateProgress(string userId, APIReadingProgress readingProgress);
    Task<Result> ResetProgress(int bookId, string userId);
    Task<Result<ReadingProgress>> GetReadingProgress(int bookId, string userId);
    Task<Result> MarkComplete(int bookId, string userId);
}