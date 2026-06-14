using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Librestack.Models.APIModels;
using Librestack.Interfaces;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingProgressController : ControllerBase
{
    private readonly IReadingProgressService _iReadingProgressService;

    public ReadingProgressController(IReadingProgressService readingProgressService)
    {
        _iReadingProgressService = readingProgressService;
    }

    [HttpPost("updateProgress")]
    [Authorize]
    public async Task<IActionResult> UpdateProgress(APIReadingProgress aPIReadingProgress)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.UpdateProgress(UserId, aPIReadingProgress);
        return result ? Ok("Reading Progress Updated") : BadRequest("Reading Progress update failed");
    }

    [HttpPost("resetProgress")]
    [Authorize]
    public async Task<IActionResult> ResetProgress(int bookId)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.ResetProgress(bookId, UserId);
        return result ? Ok("Reading Progress Reset") : BadRequest("Unable to reset reading progress");
    }
}