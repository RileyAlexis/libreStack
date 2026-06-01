using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Librestack.Models.APIModels;
using Librestack.Services;

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
    public async Task<IActionResult> CreateBookmark(int libraryId, ApiBookmarkModel apiBookmarkModel)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.CreateBookmark(libraryId, UserId, apiBookmarkModel);
        return result ? Ok("Bookmark Created") : BadRequest("Error creating bookmark");
    }

    [HttpPost("updateBookmark")]
    [Authorize]
    public async Task<IActionResult> UpdateBookmark(int id, string userId, ApiBookmarkModel apiBookmarkModel)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.UpdateBookmark(id, userId, apiBookmarkModel);
        return result ? Ok("Bookmark updated") : BadRequest("Error updating bookmark");
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> DeleteBookmark(int id)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _iBookmarkService.DeleteBookmark(id, UserId);
        return result ? Ok("Bookmark deleted") : BadRequest("Error deleting bookmark");
    }
}
