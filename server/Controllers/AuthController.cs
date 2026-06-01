using System.Security.Claims;
using Librestack.Models;
using Librestack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "User created successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request);
        if (token is null)
            return Unauthorized(new { message = "Invalid username or password" });

        return Ok(new { token });
    }

    [HttpPost("admin/register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RegisterAdminUser([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAdminUserAsync(request);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Admin user created and role assigned successfully" });
    }

    [HttpPost("admin/assign-role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignRoleToUser([FromBody] AssignRoleRequest request)
    {
        var success = await _authService.AssignRoleToUserAsync(request.UserId, "Admin");
        if (!success)
            return BadRequest(new { message = "Failed to assign role. User or role might not exist." });

        return Ok(new { message = $"Role 'Admin' assigned to user {request.UserId} successfully." });
    }
}
