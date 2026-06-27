using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Librestack.Models.APIModels;
using Librestack.Interfaces;
using Librestack.Models;

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

    [HttpPost("markComplete")]
    [Authorize]
    public async Task<IActionResult> MarkComplete(int bookId)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.MarkComplete(bookId, UserId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("markNotComplete")]
    [Authorize]
    public async Task<IActionResult> MarkNotComplete(int bookId)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.MarkComplete(bookId, UserId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);

    }

    [HttpGet("readingProgress")]
    [Authorize]
    public async Task<IActionResult> GetReadingProgress(int bookId)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.GetReadingProgress(bookId, UserId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("updateProgress")]
    [Authorize]
    public async Task<IActionResult> UpdateProgress([FromBody] APIReadingProgress aPIReadingProgress)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.UpdateProgress(UserId, aPIReadingProgress);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("resetProgress")]
    [Authorize]
    public async Task<IActionResult> ResetProgress(int bookId)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iReadingProgressService.ResetProgress(bookId, UserId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }
}