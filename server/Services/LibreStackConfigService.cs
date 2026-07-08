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

    public async Task<Result<LibreStackConfig>> GetConfigData()
    {
        var configData = await _db.LibreStackConfig.FirstOrDefaultAsync();

        if (configData is null)
            return Result<LibreStackConfig>.Failure("No config data found - complete setup", ErrorType.NotFound);

        return Result<LibreStackConfig>.Success(configData);
    }

    public async Task<Result> SaveConfig(LibreStackConfig config)
    {
        var existingConfig = await _db.LibreStackConfig.FirstOrDefaultAsync();

        if (existingConfig is null)
        {
            _db.LibreStackConfig.Add(config);
        }
        else
        {
            config.Id = existingConfig.Id;
            _db.Entry(existingConfig).CurrentValues.SetValues(config);
        }

        await _db.SaveChangesAsync();
        return Result.Success();
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