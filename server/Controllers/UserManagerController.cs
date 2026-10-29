using System.Security.Claims;
using Librestack.Interfaces;
using Librestack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserManagerController : ControllerBase
{
    private readonly IUserManageService _iUserManagerService;

    public UserManagerController(IUserManageService userManageService)
    {
        _iUserManagerService = userManageService;
    }

    [HttpGet("GetAllUsers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var result = await _iUserManagerService.GetAllUsers();
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("DisableUser")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DisableUser(string UserId)
    {
        var result = await _iUserManagerService.DisableUser(UserId);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok();
    }

    [HttpPost("EnableUser")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> EnableUser(string UserId)
    {
        var result = await _iUserManagerService.EnableUser(UserId);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok();
    }

    [HttpDelete("DeleteUser")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string UserId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();
        if (UserId == userId)
            return BadRequest("Cannot Delete Current User account");

        var result = await _iUserManagerService.DeleteUser(UserId);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok();
    }
}
