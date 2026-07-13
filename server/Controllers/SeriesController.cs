using System.Security.Claims;
using Librestack.Interfaces;
using Librestack.Models.APIModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Librestack.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeriesController : ControllerBase
{
    private readonly ISeriesService _iSeriesService;

    public SeriesController(ISeriesService seriesService)
    {
        _iSeriesService = seriesService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetUserSeries()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iSeriesService.GetUserSeries(userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpGet("GetSeriesByLibrary")]
    [Authorize]
    public async Task<IActionResult> GetseriesByLibrary(int libraryId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iSeriesService.GetSeriesByLibrary(libraryId, userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    public record UpdateSeriesRequest(int SeriesId, string SeriesTitle, int SeriesTotal);

    [HttpPatch]
    [Authorize]
    public async Task<IActionResult> UpdateUserSeries([FromBody] UpdateSeriesRequest seriesRequest)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var apiSeries = new ApiSeries
        {
            SeriesTitle = seriesRequest.SeriesTitle,
            SeriesTotal = seriesRequest.SeriesTotal,
            Id = seriesRequest.SeriesId
        };

        var result = await _iSeriesService.UpdateSeries(apiSeries, userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    public record CreateNewSeriesRequest(string seriesTitle, int seriesTotal);

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateNewSeries([FromBody] CreateNewSeriesRequest newSeries)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var apiSeries = new ApiSeries
        {
            SeriesTitle = newSeries.seriesTitle,
            SeriesTotal = newSeries.seriesTotal
        };

        var result = await _iSeriesService.CreateNewSeries(apiSeries, userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> DeleteSeries(int seriesId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iSeriesService.DeleteSeries(seriesId, userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result);
    }


}