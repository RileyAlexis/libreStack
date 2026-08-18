using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Librestack.Models.APIModels;
using Librestack.Interfaces;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookmarkController : ControllerBase
{
    private readonly IBookmarkService _iBookmarkService;

    public BookmarkController(IBookmarkService bookmarkService)
    {
        _iBookmarkService = bookmarkService;
    }

    [HttpPost("createBookmark")]
    [Authorize]
    public async Task<IActionResult> CreateBookmark(int bookId, ApiBookmarkModel apiBookmarkModel)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.CreateBookmark(bookId, UserId, apiBookmarkModel);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpPost("updateBookmark")]
    [Authorize]
    public async Task<IActionResult> UpdateBookmark(int id, string userId, ApiBookmarkModel apiBookmarkModel)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.UpdateBookmark(id, userId, apiBookmarkModel);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> DeleteBookmark(int id)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.DeleteBookmark(id, UserId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }

    [HttpGet("getBookmarks")]
    [Authorize]
    public async Task<IActionResult> GetBookmarks(int bookId)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.GetBookmarksByBookId(UserId, bookId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}
