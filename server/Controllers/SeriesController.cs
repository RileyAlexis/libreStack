using System.Security.Claims;
using Librestack.Interfaces;
using Librestack.Models;
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

    [HttpPatch]
    [Authorize]
    public async Task<IActionResult> UpdateUserSeries(ApiSeries apiSeries)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var result = await _iSeriesService.UpdateSeries(apiSeries, userId);
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateNewSeries(string seriesTitle, int seriesTotal)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var apiSeries = new ApiSeries
        {
            SeriesTitle = seriesTitle,
            SeriesTotal = seriesTotal
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