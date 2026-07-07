using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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
        return Ok(new { isSetupComplete = result });
    }

    [HttpGet("getConfig")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<LibreStackConfig>>> GetConfig()
    {
        var result = await _iLibreStackConfigService.GetConfigData();
        return result;
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
        return result ? Ok("Config Saved") : BadRequest("Error saving config");
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

}