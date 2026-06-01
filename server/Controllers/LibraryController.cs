using System.Security.Claims;
using Librestack.Models.APIModels;
using Librestack.Models;
using Librestack.Services;
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

    [HttpGet("getLibrary")]
    [Authorize]
    public async Task<ActionResult<List<Library>>> GetLibrary()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iLibraryService.GetLibrary(userId);
        if (result is null)
            return BadRequest("Library does not exist");

        if (result.Count() == 0)
            return BadRequest("Library has no entries");

        return result;
    }

    [HttpGet("getLibraryEntry")]
    [Authorize]
    public async Task<ActionResult<Library>> GetLibraryEntry(int id)
    {
        Console.WriteLine($"getLibraryEntry - int value: {id}");

        if (id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iLibraryService.GetLibraryEntry(id, userId);
        if (result is null)
            return BadRequest($"id {id} not found");

        return result;
    }

    [HttpPatch("updateLibraryEntry")]
    [Authorize]
    public async Task<IActionResult> UpdateLibraryEntry(APILibrary library)
    {
        if (library.Id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var updated = await _iLibraryService.UpdateLibraryMetaData(library, userId);
        if (!updated)
            return NotFound($"Library entry with id {library.Id} not found");

        var result = new { message = "Library entry updated successfully" };
        return new JsonResult(result);
    }

    [HttpPost("addLibraryEntry")]
    [Authorize]
    public async Task<IActionResult> AddLibraryEntry(IFormFile file)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iLibraryService.AddLibraryEntry(file, UserId);
        return result ? Ok("Added to Library") : BadRequest("Upload failed");
    }

    [HttpGet("downloadLibraryEntry")]
    [Authorize]
    public async Task<IActionResult> DownloadLibraryEntry(int id)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iLibraryService.DownloadLibraryEntry(UserId, id);
        if (result is null)
            return NotFound();

        return result;
    }

    [HttpDelete("libraryEntry")]
    [Authorize]
    public async Task<IActionResult> DeleteLibraryEntry(int id)
    {
        if (id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var data = await _iLibraryService.GetLibraryEntry(id, userId);
        var deleted = await _iLibraryService.DeleteLibraryEntry(id, userId);

        if (!deleted || data is null)
            return NotFound($"id {id} not found in database");

        return Ok($"{data.Title} removed from database");
    }

}