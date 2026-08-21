using System.Security.Claims;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryScanController : ControllerBase
{
    private readonly IlibraryScanService _libraryScanService;

    public LibraryScanController(IlibraryScanService libraryService)
    {
        _libraryScanService = libraryService;
    }

    [HttpPost("scanLibrary")]
    [Authorize]
    public async Task<IActionResult> ScanLibrary(int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _libraryScanService.ScanLibraryFiles(userId, libraryId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpGet("getEpubParseErrors")]
    [Authorize]
    public async Task<IActionResult> GetEpubParseErrors()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _libraryScanService.GetEpubParseErrors(userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }
}