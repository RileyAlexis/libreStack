using Librestack.Database;
using Microsoft.EntityFrameworkCore;
using Librestack.Models;
using Librestack.Interfaces;

namespace Librestack.Services;

public class LibraryMonitorService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<LibraryMonitorService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(15);

    public LibraryMonitorService(IServiceProvider services, ILogger<LibraryMonitorService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LibrestackDbContext>();

            var config = await db.Set<LibreStackConfig>().FirstOrDefaultAsync(stoppingToken);
            if (config is null || !config.ScanLibrariesService)
            {
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                continue;
            }

            await ScanAllLibraries();
            await Task.Delay(TimeSpan.FromMinutes(config.LibraryScanInterval), stoppingToken);
        }
    }

    private async Task ScanAllLibraries()
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LibrestackDbContext>();
        var scanService = scope.ServiceProvider.GetRequiredService<IlibraryScanService>();
        var libraryIds = await db.Libraries.Select(l => new { l.Id, l.UserId }).ToListAsync();


        foreach (var library in libraryIds)
        {
            _logger.LogInformation("Scanning library {id}", library.Id);

            var result = await scanService.ScanLibraryFiles(library.UserId, library.Id);

            if (result.IsSuccess)
                _logger.LogInformation("Scan complete for library {id}", library.Id);
            else
                _logger.LogError("Scan failed for library {id}: {error}", library.Id, result.Error);
        }
    }
}