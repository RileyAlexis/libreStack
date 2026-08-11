using System.Security.Claims;
using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CollectionsController : ControllerBase
{
    private readonly ICollectionsService _collectionsService;

    public CollectionsController(ICollectionsService collectionsService)
    {
        _collectionsService = collectionsService;
    }


    public record CreateNewCollectionRequest(string collectionTitle);

    [HttpPost("createCollection")]
    [Authorize]
    public async Task<ActionResult<Collections>> CreateCollection([FromBody] CreateNewCollectionRequest collection)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _collectionsService.CreateCollection(userId, collection.collectionTitle);

        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("updateCollection")]
    [Authorize]
    public async Task<ActionResult<Collections>> UpdateCollection(Collections updatedCollection)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _collectionsService.UpdateCollection(userId, updatedCollection);

        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpGet("getAllUserCollections")]
    [Authorize]
    public async Task<ActionResult> GetAllUserCollections()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _collectionsService.GetAllUserCollections(userId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    public record AddBookToCollectionRequest(int BookId, int CollectionId);

    [HttpPost("addBookToCollection")]
    [Authorize]
    public async Task<ActionResult> AddBookToCollection([FromBody] AddBookToCollectionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _collectionsService.AddBookToCollection(userId, request.BookId, request.CollectionId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("removeBookFromCollection")]
    [Authorize]
    public async Task<ActionResult> RemoveBookFromCollection(int bookId, int collectionId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _collectionsService.RemoveBookFromCollection(userId, bookId, collectionId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }


    [HttpDelete]
    [Authorize]
    public async Task<ActionResult> DeleteCollection(int collectionId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _collectionsService.DeleteCollection(userId, collectionId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }
}