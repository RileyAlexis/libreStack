using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using libreStack.Migrations;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly ILibreStackConfigService _iLibreStackConfigService;
    private readonly IServerStatsService _iServerStatsService;
    private readonly IAuthService _iAuthService;

    public ConfigController(
        ILibreStackConfigService libreStackConfigService,
        IServerStatsService serverStatsService,
        IAuthService authService)
    {
        _iLibreStackConfigService = libreStackConfigService;
        _iServerStatsService = serverStatsService;
        _iAuthService = authService;
    }

    [HttpGet("checkIfSetupComplete")]
    public async Task<ActionResult<object>> CheckIfSetupComplete()
    {
        var result = await _iLibreStackConfigService.CheckIfSetupComplete();
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpGet("getConfig")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LibreStackConfig>> GetConfig()
    {
        var result = await _iLibreStackConfigService.GetConfigData();
        return Ok(result);
    }

    [HttpPost("markSetupAsComplete")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkSetupAsComplete(bool isComplete)
    {
        var result = await _iLibreStackConfigService.MarkSetupAsComplete(isComplete);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpPost("saveConfig")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SaveConfig(LibreStackConfig config)
    {
        var result = await _iLibreStackConfigService.SaveConfig(config);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpGet("serverStats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetServerStats()
    {
        var result = await _iServerStatsService.GetServerStats();
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    public record BasePath(string Path);

    [HttpPost("setBasePath")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetBasePath([FromBody] BasePath basePath)
    {
        var result = await _iLibreStackConfigService.SetBasePath(basePath.Path);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

}