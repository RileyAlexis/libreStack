using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Librestack.Models.APIModels;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILibraryService _libraryService;

    public AuthController(IAuthService authService, ILibraryService libraryService)
    {
        _authService = authService;
        _libraryService = libraryService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "User created successfully" });
    }

    [HttpPost("createNewUser")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateNewUser(ApiCreateNewUserModel newUserModel)
    {
        if (string.IsNullOrWhiteSpace(newUserModel.LibraryName) || string.IsNullOrWhiteSpace(newUserModel.LibraryPath))
        {
            return BadRequest("User must have a library name and path");
        }

        var newUser = new RegisterRequest(
            Username: newUserModel.Username,
            Email: newUserModel.Email,
            Password: newUserModel.Password);

        var response = await _authService.CreateNewUser(newUser);
        if (!response.Result.Succeeded)
            return BadRequest(response.Result.Errors);

        var userId = response.UserId;

        var libraryData = new Library
        {
            Name = newUserModel.LibraryName,
            LibraryPath = newUserModel.LibraryPath
        };

        var libraryResponse = await _libraryService.CreateLibrary(userId!, libraryData);

        if (libraryResponse.IsSuccess)
        {
            return Ok(new { message = "User and Library successfully created" });
        }
        else
        {
            return BadRequest("Unexpected Error");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginWithRefreshAsync(request);
        if (response is null)
            return Unauthorized(new { message = "Invalid username or password" });

        return Ok(new { accessToken = response.AccessToken, refreshToken = response.RefreshToken });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var result = await _authService.RefreshAccessTokenAsync(request.RefreshToken);
        if (result is null)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        return Ok(new { accessToken = result.AccessToken, refreshToken = result.RefreshToken });
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RefreshRequest request)
    {
        var ok = await _authService.RevokeRefreshTokenAsync(request.RefreshToken);
        if (!ok)
            return BadRequest(new { message = "Token not found or already revoked." });

        return Ok(new { message = "Refresh token revoked" });
    }

    [HttpGet("user")]
    [Authorize]
    public async Task<IActionResult> GetUser()
    {
        var principal = HttpContext.User;
        var userResponse = await _authService.GetCurrentUserAsync(principal);

        if (userResponse == null)
        {
            return Unauthorized(new { message = "User details could not be retrieved." });
        }
        return Ok(userResponse);
    }

    [HttpPost("admin/register")]
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
