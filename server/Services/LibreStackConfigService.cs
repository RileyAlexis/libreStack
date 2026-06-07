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
            await _db.SaveChangesAsync();
        }
        else
        {
            _db.LibreStackConfig.Update(config);
            await _db.SaveChangesAsync();
        }
        _db.SaveChanges();
        return true;

    }

    public async Task<Result> MarkSetupAsComplete(bool isComplete)
    {
        var config = await _db.LibreStackConfig.FirstOrDefaultAsync();

        if (config is null)
        {
            var newConfig = new LibreStackConfig { IsSetupComplete = true };
            await _db.LibreStackConfig.AddAsync(newConfig);
            await _db.SaveChangesAsync();
            return Result.Success();
        }

        if (config.IsSetupComplete == true)
            return Result.Failure("Setup already complete", ErrorType.BadRequest);

        if (config is not null)
        {
            config.IsSetupComplete = isComplete;
            _db.LibreStackConfig.Update(config);
            await _db.SaveChangesAsync();
            return Result.Success();
        }
        return Result.Failure("Failed to write config", ErrorType.Unexpected);
    }
}