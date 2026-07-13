using System.Security.Claims;
using Librestack.Interfaces;
using Librestack.Models;
using Librestack.Models.APIModels;
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

    [HttpGet("getLibrary")]
    [Authorize]
    public async Task<IActionResult> GetLibrary(int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.GetLibrary(userId, libraryId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpGet("getListOfLibraries")]
    [Authorize]
    public async Task<IActionResult> GetListOfLibraries()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.GetListOfLibraries(userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpPost("addBookToLibrary")]
    [Authorize]
    public async Task<IActionResult> AddBookToLibrary([FromQuery] int libraryId, [FromQuery] int bookId)
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

    [HttpPost("createLibrary")]
    [Authorize]
    public async Task<IActionResult> CreateLibrary([FromBody] ApiLibrary library)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var newLib = new Library
        {
            Name = library.Name,
            LibraryPath = library.LibraryPath,
            UserId = userId
        };

        var result = await _iLibraryService.CreateLibrary(userId: userId, library: newLib);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpDelete("deleteLibrary")]
    [Authorize]
    public async Task<IActionResult> DeleteLibrary(int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.DeleteLibrary(userId, libraryId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    public record LibraryUpdate(int LibraryId, string LibraryName, string LibraryPath);

    [HttpPost("updateLibrary")]
    [Authorize]
    public async Task<IActionResult> UpdateLibrary([FromBody] LibraryUpdate lib)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iLibraryService.UpdateLibrary(userId, lib.LibraryId, lib.LibraryName, lib.LibraryPath);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });
        return Ok(result);
    }
}