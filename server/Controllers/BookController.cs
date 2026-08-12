using System.Security.Claims;
using Librestack.Models.APIModels;
using Librestack.Models;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly IBookService _bookService;

    public BookController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet("getBooksByLibrary")]
    [Authorize]
    public async Task<ActionResult<List<Book>>> GetBooksByLibrary(int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _bookService.GetBooksByLibrary(userId, libraryId);

        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpGet("getBookEntry")]
    [Authorize]
    public async Task<ActionResult<Book>> GetBookEntry(int id)
    {

        if (id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _bookService.GetBookEntry(id, userId);
        if (result is null)
            return BadRequest($"id {id} not found");

        return Ok(result);
    }

    [HttpGet("getBooksBySeries")]
    [Authorize]
    public async Task<ActionResult<Book>> GetBooksBySeries(int seriesId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _bookService.GetBooksBySeries(seriesId, userId);

        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }


    [HttpPatch("updateBookEntry")]
    [Authorize]
    public async Task<ActionResult<ApiBook>> UpdateBookEntry(ApiBook book)
    {
        if (book.Id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _bookService.UpdateBookMetaData(book, userId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("addBookEntry")]
    [Authorize]
    public async Task<IActionResult> AddBookEntry(IFormFile file, int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _bookService.AddBookEntry(file, userId, libraryId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpPost("revertCoverToEpub")]
    [Authorize]
    public async Task<IActionResult> RevertCoverToEpub(int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _bookService.RevertCoverToEpub(userId, bookId);
        if (result is null)
            return BadRequest(new { error = result?.Error });

        return Ok(result);
    }

    [HttpGet("downloadBookEntry")]
    [Authorize]
    public async Task<IActionResult> DownloadBookEntry(int id)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _bookService.DownloadBookEntry(UserId, id);
        if (!result.IsSuccess)
            return BadRequest(new { error = result?.Error });

        var (stream, fileName) = result.Value;
        return File(stream, "application/epub+zip", fileName);
    }

    [HttpDelete("bookEntry")]
    [Authorize]
    public async Task<IActionResult> DeleteBookEntry(int bookId)
    {
        if (bookId == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _bookService.DeleteBookEntry(bookId, userId);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }


}