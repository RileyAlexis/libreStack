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

    public async Task<bool> CheckIfSetupComplete()
    {
        var configData = await _db.LibreStackConfig.FirstOrDefaultAsync();

        if (configData is null || configData.IsSetupComplete == false)
            return false;

        return true;

    }

    public async Task<List<LibreStackConfig>> GetConfigData()
    {
        var configData = await _db.LibreStackConfig.ToListAsync();
        if (configData is null)
            return null;

        return configData;
    }

    public async Task<bool> SaveConfig(LibreStackConfig config)
    {
        if (config.Id == 0)
        {
            _db.LibreStackConfig.Add(config);
        }
        else
        {
            _db.LibreStackConfig.Update(config);
        }
        _db.SaveChanges();
        return true;

    }

    public async Task<bool> MarkSetupAsComplete(bool isComplete)
    {
        var config = await _db.LibreStackConfig.FirstOrDefaultAsync();
        if (config is null || config.IsSetupComplete == true)
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