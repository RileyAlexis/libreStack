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

    [HttpGet("getBook")]
    [Authorize]
    public async Task<ActionResult<List<Book>>> GetBook()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var result = await _bookService.GetUserBooks(userId);
        if (result is null)
            return BadRequest("Book does not exist");

        if (result.Count() == 0)
            return BadRequest("Book has no entries");

        return result;
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

        return result;
    }

    [HttpPatch("updateBookEntry")]
    [Authorize]
    public async Task<IActionResult> UpdateBookEntry(ApiBook book)
    {
        if (book.Id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var updated = await _bookService.UpdateBookMetaData(book, userId);
        if (!updated)
            return NotFound($"Book entry with id {book.Id} not found");

        var result = new { message = "Book entry updated successfully" };
        return new JsonResult(result);
    }

    [HttpPost("addBookEntry")]
    [Authorize]
    public async Task<IActionResult> AddBookEntry(IFormFile file)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _bookService.AddBookEntry(file, UserId);
        return result ? Ok("Added to collection") : BadRequest("Upload failed");
    }

    [HttpGet("downloadBookEntry")]
    [Authorize]
    public async Task<IActionResult> DownloadBookEntry(int id)
    {
        var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (UserId is null) return Unauthorized();

        var result = await _bookService.DownloadBookEntry(UserId, id);
        if (result is null)
            return NotFound();

        return result;
    }

    [HttpDelete("bookEntry")]
    [Authorize]
    public async Task<IActionResult> DeleteBookEntry(int id)
    {
        if (id == 0)
            return BadRequest("id parameter cannot be 0");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Unauthorized();

        var data = await _bookService.GetBookEntry(id, userId);
        var deleted = await _bookService.DeleteBookEntry(id, userId);

        if (!deleted || data is null)
            return NotFound($"id {id} not found in database");

        return Ok($"{data.Title} removed from database");
    }

}