using System.Security.Claims;
using Librestack.Models;
using Librestack.Models.APIModels;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookTagController : ControllerBase
{
    private readonly IBookTagService _iBookTagService;

    public BookTagController(IBookTagService bookTagService)
    {
        _iBookTagService = bookTagService;
    }

    [HttpPost("createUserTag")]
    [Authorize]
    public async Task<IActionResult> CreateUserTag(BookTag bookTag)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iBookTagService.CreateUserTag(userId, bookTag);
        return result ? Ok("Tag Created") : BadRequest("Adding new tag failed");
    }

    [HttpPost("updateUserTag")]
    [Authorize]
    public async Task<IActionResult> UpdateUserTag(BookTag bookTag)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iBookTagService.UpdateUserTag(userId, bookTag);
        return result ? Ok("User tag Updated") : BadRequest("Updating tag failed");
    }

    [HttpGet("getAllUserTags")]
    [Authorize]
    public async Task<ActionResult<List<BookTag>>> GetAllUserTags()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iBookTagService.GetAllUserTags(userId);
        return result;
    }

    [HttpGet("getUserTag")]
    [Authorize]
    public async Task<ActionResult<BookTag?>> GetUserTag(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var tag = await _iBookTagService.GetUserTag(userId, id);
        return tag;
    }

    [HttpGet("getAllTags")]
    [Authorize]
    public async Task<ActionResult<List<BookTag>>> GetAllTags()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var tags = await _iBookTagService.GetAllTags(userId);
        return tags;
    }

    [HttpPost("applyTag")]
    [Authorize]
    public async Task<IActionResult> ApplyTag(ApiApplyTag applyTag)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iBookTagService.ApplyTag(
            userId: userId, bookId: applyTag.BookId, tagId: applyTag.TagId);

        return result ? Ok("Tag Updated") : BadRequest("Unable to add tag");
    }

    [HttpDelete("deleteUserTag")]
    [Authorize]
    public async Task<IActionResult> DeleteUserTag(int id)
    {
        if (id == 0)
            return BadRequest("id parameter cannot be 0");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _iBookTagService.DeleteUserTag(userId: userId, id: id);
        return result ? Ok($"Tag Deleted") : BadRequest("Error deleting tag");
    }
}
