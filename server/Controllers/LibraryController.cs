using System.Security.Claims;
using Librestack.Interfaces;
using Librestack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _iLibraryService;

    public LibraryController(ILibraryService libraryService)
    {
        _iLibraryService = libraryService;
    }

    [HttpGet("getAllLibraries")]
    [Authorize]
    public async Task<IActionResult> GetAllLibraries()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.GetAllLibraries(userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpPost("addBookToLibrary")]
    [Authorize]
    public async Task<IActionResult> AddBookToLibrary(int libraryId, int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.AddBookToLibrary(userId, libraryId, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpPost("removeFromLibrary")]
    [Authorize]
    public async Task<IActionResult> RemoveFromLibrary(int libraryId, int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.RemoveBookFromLibrary(userId, libraryId, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }
}