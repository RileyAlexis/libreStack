using System.Security.Claims;
using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Librestack.Models.APIModels;

namespace Librestack.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class UserSettingsController : ControllerBase
{
    private readonly IUserSettingsService _userSettingsService;

    public UserSettingsController(IUserSettingsService userSettingsService)
    {
        _userSettingsService = userSettingsService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiUserSettings>> GetUserSettings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _userSettingsService.GetUserSettings(userId);

        if (result is null || result.Value is null)
            return BadRequest(new { error = result?.Error });

        var mappedSettings = UserSettingsMapper.ToDto(result.Value);

        return Ok(mappedSettings);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SaveUserSettings(ApiUserSettings settings)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var mappedSettings = UserSettingsMapper.FromDto(settings, userId);

        var result = await _userSettingsService.UpdateUserSettings(mappedSettings, userId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }


}