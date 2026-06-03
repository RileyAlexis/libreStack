using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class LibreStackConfigService : ILibreStackConfigService
{
    private readonly LibrestackDbContext _db;

    public LibreStackConfigService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<bool> SetCompleteSetup(bool isComplete)
    {
        var config = await _db.LibreStackConfig.FirstOrDefaultAsync();
        if (config is null)
            return false;

        config.IsSetupComplete = isComplete;
        _db.LibreStackConfig.Update(config);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLibraryPath(string path)
    {
        var config = await _db.LibreStackConfig.FirstOrDefaultAsync();
        if (config is null || path.IsWhiteSpace() || path is null)
            return false;

        config.LibraryPath = path;

        _db.LibreStackConfig.Update(config);
        await _db.SaveChangesAsync();
        return true;
    }
}