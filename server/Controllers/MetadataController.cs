using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Librestack.Controllers;

[ApiController]
[Route("/api/metadata")]
public class MetadataController : ControllerBase
{
    private readonly IOpenLibraryService _iOpenLibraryService;
    private readonly IWikidataService _iWikidataService;

    public MetadataController(IOpenLibraryService openLibraryService, IWikidataService wikidataService)
    {
        _iOpenLibraryService = openLibraryService;
        _iWikidataService = wikidataService;
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

    [HttpGet("refreshLibraryMetaData")]
    [Authorize]
    public async Task<IActionResult> RefreshLibraryMetaData(int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iOpenLibraryService.RefreshLibraryMetadata(userId, libraryId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok();
    }

    [HttpGet("queryWikidata")]
    [Authorize]
    public async Task<IActionResult> QueryWikidata(int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iWikidataService.QueryWikidata(userId, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok();
    }
}