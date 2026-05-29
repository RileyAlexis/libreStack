using System.Security.Claims;
using Librestack.Models;
using Librestack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        return await _interfaceLibraryService.GetLibrary();
    }

    [HttpGet("getLibraryEntry")]
    [Authorize]
    public async Task<ActionResult<Library>> GetLibraryEntry(int id)
    {
        return await _interfaceLibraryService.GetLibraryEntry(id);
    }

    [HttpPost("updateLibraryEntry")]
    [Authorize]
    public async Task<IActionResult> UpdateLibraryEntry(Library library)
    {
        var id = library.Id;

        var updated = await _interfaceLibraryService.UpdateLibraryMetaData(library);
        if (!updated)
            return NotFound();

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
        var deleted = await _interfaceLibraryService.DeleteLibraryEntry(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }

}