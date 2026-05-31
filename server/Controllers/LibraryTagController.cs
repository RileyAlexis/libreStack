using System.Security.Claims;
using Librestack.Models;
using Librestack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryTagController : ControllerBase
{
    private readonly InterfaceLibraryTagService _interfaceLibraryTagService;

    public LibraryTagController(InterfaceLibraryTagService libraryTagService)
    {
        _interfaceLibraryTagService = libraryTagService;
    }

    [HttpPost("createUserTag")]
    [Authorize]
    public async Task<IActionResult> CreateUserTag(LibraryTag libraryTag)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _interfaceLibraryTagService.CreateUserTag(userId, libraryTag);
        return result ? Ok("Tag Created") : BadRequest("Adding new tag failed");
    }

    [HttpPost("updateUserTag")]
    [Authorize]
    public async Task<IActionResult> UpdateUserTag(LibraryTag libraryTag)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _interfaceLibraryTagService.UpdateUserTag(userId, libraryTag);
        return result ? Ok("Tag Updated") : BadRequest("Updating tag failed");
    }

    [HttpGet("getAllUserTags")]
    [Authorize]
    public async Task<ActionResult<List<LibraryTag>>> GetAllUserTags()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _interfaceLibraryTagService.GetAllUserTags(userId);
        return result;
    }

    [HttpGet("getAllTags")]
    [Authorize]
    public async Task<ActionResult<List<LibraryTag>>> GeAllTags()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var tags = await _interfaceLibraryTagService.GetAllTags(userId);
        return tags;
    }
}
