using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly ILibreStackConfigService _iLibreStackConfigService;
    private readonly IAuthService _iAuthService;

    public ConfigController(ILibreStackConfigService libreStackConfigService, IAuthService authService)
    {
        _iLibreStackConfigService = libreStackConfigService;
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
        Console.WriteLine("*************************");
        Console.WriteLine(isComplete);
        var result = await _iLibreStackConfigService.MarkSetupAsComplete(isComplete);
        return result ? Ok("Setup Completed") : BadRequest("Unable to mark setup as complete");
    }

    [HttpPost("saveConfig")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SaveConfig(LibreStackConfig config)
    {
        var result = await _iLibreStackConfigService.SaveConfig(config);
        return result ? Ok("Config Saved") : BadRequest("Error saving config");
    }

    [HttpPost("updateLibraryPath")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateLibraryPath(string libraryPath)
    {
        var result = await _iLibreStackConfigService.UpdateLibraryPath(libraryPath);
        return result ? Ok("Library path updated") : BadRequest("Error updating library path");
    }

}