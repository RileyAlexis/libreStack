using Librestack.Database;
using Librestack.Interfaces;
using Librestack.Models;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Librestack.Services;

public class ServerStatsService : IServerStatsService
{
    private readonly LibrestackDbContext _db;
    private readonly ILogger<ServerStatsService> _logger;

    public ServerStatsService(LibrestackDbContext db, ILogger<ServerStatsService> logger)
    {
        _db = db;
        _logger = logger;
    }

    private long CalculateDirectorySize(string path)
    {
        if (!Directory.Exists(path)) return 0;

        long totalSize = 0;
        int filesProcessed = 0;
        const int MaxFilesToCount = 100_000; // Limit to prevent hanging on massive folders
        TimeSpan maxDuration = TimeSpan.FromSeconds(30); // Hard timeout
        var watch = Stopwatch.StartNew();

        // Use a stack for an iterative approach (safer than recursion)
        var stack = new Stack<string>();
        stack.Push(path);

        while (stack.Count > 0)
        {
            var currentPath = stack.Pop();

            // Check timeout periodically
            if (watch.Elapsed > maxDuration)
            {
                _logger.LogWarning("Directory size calculation timed out for path: {Path}", path);
                return -1; // Return sentinel value indicating timeout
            }

            try
            {
                var dirInfo = new DirectoryInfo(currentPath);

                // Process files in the current directory
                foreach (var file in dirInfo.GetFiles())
                {
                    totalSize += file.Length;
                    filesProcessed++;

                    if (filesProcessed > MaxFilesToCount)
                    {
                        _logger.LogWarning("Directory size reached limit of {Max} files for path: {Path}", MaxFilesToCount, path);
                        return totalSize; // Return what we have so far
                    }
                }

                // Add subdirectories to the stack for processing
                foreach (var dir in dirInfo.GetDirectories())
                {
                    stack.Push(dir.FullName);
                }
            }
            catch (UnauthorizedAccessException)
            {
                // Skip folders we don't have permission to read and continue
                continue;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accessing directory {Path}", currentPath);
            }
        }

        watch.Stop();
        return totalSize;
    }

    private long CalculateDiskFreeSpace(string path)
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "df",
                ArgumentList = { "-Pk", path },
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(psi);
            if (process == null)
            {
                _logger.LogError($"Could not start df process for {path}");
                return 0;
            }

            string output = process.StandardOutput.ReadToEnd();
            process.WaitForExit();

            var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length < 2)
            {
                _logger.LogError($"Unexpected df output for {path}: {output}");
                return 0;
            }

            // Line format: Filesystem  1024-blocks  Used  Available  Capacity  Mounted-on
            var fields = lines[1].Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (fields.Length < 4 || !long.TryParse(fields[3], out long availableKb))
            {
                _logger.LogError($"Could not parse df output for {path}: {lines[1]}");
                return 0;
            }

            return availableKb * 1024; // bytes, matching DriveInfo.AvailableFreeSpace's unit
        }
        catch (Exception ex)
        {
            _logger.LogError($"Could not determine disk free space for {path}: {ex.Message}");
            return 0;
        }
    }

    public async Task<Result<ServerStats>> GetServerStats()
    {
        var libraries = await _db.Libraries
            .Include(l => l.Books)
                .ThenInclude(b => b.ReadingProgress).ToListAsync();


        var libraryStatsList = libraries.Select(l => new LibraryStats
        {
            LibraryId = l.Id,
            LibraryName = l.Name,
            BookCount = l.Books.Count(),
            AuthorCount = l.Books.Where(b => b.Author != null).Select(b => b.Author).Distinct().Count(),
            SeriesCount = l.Books.Where(b => b.SeriesId != null).Select(b => b.SeriesId).Distinct().Count(),
            CompletedBookCount = l.Books.Sum(b => b.ReadingProgress.Count(p => p.IsComplete)),
            StorageSizeKb = CalculateDirectorySize(l.LibraryPath) / 1024,
            LibraryPath = l.LibraryPath,
            DriveFreeSpace = CalculateDiskFreeSpace(l.LibraryPath) / 1024
        }).ToList();

        var totalBooks = libraryStatsList.Sum(ls => ls.BookCount);
        var totalStorageSizeKB = libraryStatsList.Sum(ls => (int)ls.StorageSizeKb);
        var totalAuthorCount = libraryStatsList.Sum(ls => ls.AuthorCount);
        var totalSeriesCount = libraryStatsList.Sum(ls => ls.SeriesCount);
        var totalCollectionCount = libraryStatsList.Sum(ls => ls.CollectionCount);
        var totalCompletedCount = libraryStatsList.Sum(ls => ls.CompletedBookCount);


        var usersCount = await _db.Users.CountAsync();


        var serverStats = new ServerStats
        {
            LibraryStats = libraryStatsList,
            TotalBooks = totalBooks,
            TotalStorageSizeKB = totalStorageSizeKB,
            TotalAuthorCount = totalAuthorCount,
            TotalSeriesCount = totalSeriesCount,
            TotalCollectionCount = totalCollectionCount,
            TotalCompletedCount = totalCompletedCount,
            UsersCount = usersCount
        };

        return Result<ServerStats>.Success(serverStats);
    }
}