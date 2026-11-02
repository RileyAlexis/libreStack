using Librestack.Interfaces;
using Librestack.Models;

namespace Librestack.Services;

public class PathService : IPathService
{
    private static readonly string[] BlockedPaths = OperatingSystem.IsWindows()
        ? new[]
        {
            Environment.GetFolderPath(Environment.SpecialFolder.Windows),
            Environment.GetFolderPath(Environment.SpecialFolder.System),
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
        }
        : new[]
        {
            "/bin", "/boot", "/dev", "/etc", "/lib", "/lib64",
            "/proc", "/root", "/run", "/sbin", "/sys", "/usr",
        };

    public async Task<Result> CheckPath(string path)
    {
        try
        {
            var safePath = await SanitizePath(path);

            if (IsRestrictedPath(safePath))
                return Result.Failure("Path is a restricted system location", ErrorType.BadRequest);

            if (!Directory.Exists(safePath))
                return Result.Failure($"The path '{safePath}' does not exist.", ErrorType.BadRequest);

            try
            {
                _ = Directory.EnumerateFileSystemEntries(safePath).FirstOrDefault();
            }
            catch (UnauthorizedAccessException)
            {
                return Result.Failure("No read access to path", ErrorType.BadRequest);
            }

            var testFile = Path.Combine(safePath, $".write-test-{Guid.NewGuid():N}");
            try
            {
                await File.WriteAllTextAsync(testFile, string.Empty);
                File.Delete(testFile);
            }
            catch (UnauthorizedAccessException)
            {
                return Result.Failure("No write access to path", ErrorType.BadRequest);
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message, ErrorType.BadRequest);
        }
    }

    private static bool IsRestrictedPath(string path)
    {
        if (Path.GetPathRoot(path) == path) return true;

        var comparison = OperatingSystem.IsWindows()
            ? StringComparison.OrdinalIgnoreCase
            : StringComparison.Ordinal;
        var trimmed = path.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        return BlockedPaths.Any(b =>
            !string.IsNullOrEmpty(b) &&
            (trimmed.Equals(b, comparison) ||
             trimmed.StartsWith(b + Path.DirectorySeparatorChar, comparison)));
    }

    public Task<string> SanitizePath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            throw new ArgumentException("Path cannot be empty");

        path = path.Trim();

        if (path.IndexOfAny(Path.GetInvalidPathChars()) >= 0)
            throw new ArgumentException("Path contains invalid characters");

        if (path.Split('/', '\\').Any(segment => segment == ".."))
            throw new ArgumentException("Path traversal is not allowed");

        return Task.FromResult(Path.GetFullPath(path));
    }

    public string CleanStringForPath(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var invalid = new HashSet<char>(Path.GetInvalidFileNameChars()) { '/', '\\', ':' };
        var cleaned = new string(input.Where(c => !invalid.Contains(c)).ToArray());

        while (cleaned.Contains(".."))
            cleaned = cleaned.Replace("..", string.Empty);

        return cleaned.Trim().Trim('.').Trim();
    }
}