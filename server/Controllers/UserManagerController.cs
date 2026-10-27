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
}
