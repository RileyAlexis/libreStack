using Librestack.Interfaces;
using Librestack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Librestack.Controllers;

[ApiController]
[Route("/api/metadata")]
public class MetadataController : ControllerBase
{
    private readonly IOpenLibraryService _iOpenLibraryService;

    public MetadataController(IOpenLibraryService openLibraryService)
    {
        _iOpenLibraryService = openLibraryService;
    }

    [HttpGet("applyOpenLibraryData")]
    [Authorize]
    public async Task<IActionResult> ApplyOpenLibraryData(int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iOpenLibraryService.QueryOpenLibrary(userId, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok();
    }
}