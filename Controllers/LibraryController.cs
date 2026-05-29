using System.Security.Claims;
using Librestack.Models;
using Librestack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Superpower.Model;

namespace Librestack.Controllers;

[ApiController]
[Route("[controller]")]
public class LibraryController : ControllerBase
{
    private readonly InterfaceLibraryService _interfaceLibraryService;

    public LibraryController(InterfaceLibraryService libraryService)
    {
        _interfaceLibraryService = libraryService;
    }

    [HttpGet("getLibrary")]
    [Authorize]
    public async Task<ActionResult<List<Library>>> GetLibrary()
    {
        var result = await _interfaceLibraryService.GetLibrary();
        if (result is null)
            return BadRequest("Library does not exist");

        if (result.Count() == 0)
            return BadRequest("Library has no entries");

        if (result.Count() > 1)
            return StatusCode(418);

        return result;
    }

    [HttpGet("getLibraryEntry")]
    [Authorize]
    public async Task<ActionResult<Library>> GetLibraryEntry(int id)
    {
        Console.WriteLine($"getLibraryEntry - int value: {id}");

        if (id == 0)
            return BadRequest("id parameter cannot be 0");

        var result = await _interfaceLibraryService.GetLibraryEntry(id);
        if (result is null)
            return BadRequest($"id {id} not found");

        return result;
    }

    [HttpPost("updateLibraryEntry")]
    [Authorize]
    public async Task<IActionResult> UpdateLibraryEntry(Library library)
    {
        var id = library.Id;

        var updated = await _interfaceLibraryService.UpdateLibraryMetaData(library);
        if (!updated)
            return NotFound($"title {library.Title} not found");

        var result = new { message = "Library entry updated" };
        return new JsonResult(result);
    }

    [HttpPost("addLibraryEntry")]
    // [Authorize]
    public async Task<IActionResult> AddLibraryEntry(IFormFile file)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _interfaceLibraryService.AddLibraryEntry(file, UserId);
        return result ? Ok() : BadRequest("Upload failed");
    }

    [HttpDelete("libraryEntry")]
    [Authorize]
    public async Task<IActionResult> DeleteLibraryEntry(int id)
    {
        if (id == 0)
            return BadRequest("id parameter cannot be 0");

        var data = await _interfaceLibraryService.GetLibraryEntry(id);
        var deleted = await _interfaceLibraryService.DeleteLibraryEntry(id);

        if (!deleted || data is null)
            return NotFound($"id {id} not found in database");

        return Ok($"{data.Title} removed from database");
    }

}