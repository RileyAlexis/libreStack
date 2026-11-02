using Librestack.Models;

namespace Librestack.Interfaces;

public interface IPathService
{
    Task<Result> CheckPath(string path);
    Task<string> SanitizePath(string path);
    string CleanStringForPath(string input);
}