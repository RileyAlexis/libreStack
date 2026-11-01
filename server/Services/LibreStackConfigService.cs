using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class LibreStackConfigService : ILibreStackConfigService
{
    private readonly LibrestackDbContext _db;
    private readonly IAuthService _authService;

    public LibreStackConfigService(LibrestackDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    public async Task<Result<LibreStackSetup>> CheckIfSetupComplete()
    {
        var configData = await _db.LibreStackConfig.FirstOrDefaultAsync();
        var doesAdminExist = await _authService.AdminUserExists();

        if (configData is null)
            return Result<LibreStackSetup>.Success(new LibreStackSetup(false, false, doesAdminExist));


        if (string.IsNullOrEmpty(configData.LibreStackBasePath))
            return Result<LibreStackSetup>.Success(new LibreStackSetup(true, false, doesAdminExist));
        else
            return Result<LibreStackSetup>.Success(new LibreStackSetup(true, true, doesAdminExist));

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

    public async Task<Result> SetBasePath(string basePath)
    {
        if (string.IsNullOrEmpty(basePath))
            return Result.Failure("Invalid Path", ErrorType.BadRequest);

        try
        {
            var dir = new DirectoryInfo(basePath);
            if (!dir.Exists)
                return Result.Failure("The Provided Path does not Exist", ErrorType.NotFound);

            string testFilePath = Path.Combine(basePath, Guid.NewGuid().ToString() + ".text");
            try
            {
                using (var fs = File.Create(testFilePath)) { }
            }

            finally
            {
                if (File.Exists(testFilePath)) File.Delete(testFilePath);
            }

            var existingConfig = await _db.LibreStackConfig.FirstOrDefaultAsync();

            if (existingConfig is null)
            {
                var configData = new LibreStackConfig()
                {
                    IsSetupComplete = false,
                    LibreStackBasePath = basePath
                };

                _db.LibreStackConfig.Add(configData);
            }
            else
            {
                existingConfig.LibreStackBasePath = basePath;
                _db.LibreStackConfig.Update(existingConfig);
            }

            await _db.SaveChangesAsync();
            return Result.Success();
        }
        catch (UnauthorizedAccessException)
        {
            return Result.Failure("LibreStack does not have Read and Write access to the provided path", ErrorType.Forbidden);
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred while verifying the path: {ex.Message}", ErrorType.Unexpected);
        }

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