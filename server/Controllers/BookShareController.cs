using System.Security.Claims;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookShareController : ControllerBase
{
    private readonly IBookShareService _iBookShareService;

    public BookShareController(IBookShareService bookShareService)
    {
        _iBookShareService = bookShareService;
    }

    [HttpPost("ShareBook")]
    [Authorize]
    public async Task<IActionResult> ShareBook(string userIdRecipient, int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iBookShareService.ShareBook(userId, userIdRecipient, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpPost("UnshareBook")]
    [Authorize]
    public async Task<IActionResult> UnshareBook(string userIdRecipient, int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iBookShareService.UnshareBook(userId, userIdRecipient, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }
}