using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;

namespace Librestack.Services;

public class SeriesService : ISeriesService
{
    private readonly LibrestackDbContext _db;

    public SeriesService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Series> ResolveOrCreateSeriesAsync(string normalizedTitle, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("userId is required", nameof(userId));

        var tracked = _db.ChangeTracker.Entries<Series>()
            .Select(e => e.Entity)
            .FirstOrDefault(s => s.SeriesTitle == normalizedTitle && s.UserId == userId);
        if (tracked != null) return tracked;

        var existing = await _db.Series
            .FirstOrDefaultAsync(s => s.SeriesTitle == normalizedTitle && s.UserId == userId);
        if (existing != null) return existing;

        var series = new Series { SeriesTitle = normalizedTitle, UserId = userId };
        _db.Series.Add(series);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            _db.Entry(series).State = EntityState.Detached;
            series = await _db.Series.FirstAsync(s => s.SeriesTitle == normalizedTitle && s.UserId == userId);
        }

        return series;
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is Npgsql.PostgresException pg && pg.SqlState == "23505";

    public async Task<Result<ApiSeries>> UpdateSeries(ApiSeries apiSeries, string userId)
    {
        var existing = await _db.Series
            .FirstOrDefaultAsync(s => s.Id == apiSeries.Id && s.UserId == userId);

        if (existing is null)
            return Result<ApiSeries>.Failure("Series not found", ErrorType.NotFound);

        existing.SeriesTitle = apiSeries.SeriesTitle;
        existing.SeriesTotal = apiSeries.SeriesTotal;

        await _db.SaveChangesAsync();

        return Result<ApiSeries>.Success(new ApiSeries
        {
            Id = existing.Id,
            SeriesTitle = existing.SeriesTitle,
            SeriesTotal = existing.SeriesTotal
        });
    }

    public async Task<Result<ApiSeries>> CreateNewSeries(ApiSeries apiSeries, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<ApiSeries>.Failure("User Id is required", ErrorType.BadRequest);

        if (string.IsNullOrWhiteSpace(apiSeries.SeriesTitle))
            return Result<ApiSeries>.Failure("Series title is required", ErrorType.BadRequest);

        var normalizedTitle = apiSeries.SeriesTitle.Trim();

        var existing = await _db.Series
            .FirstOrDefaultAsync(s => s.SeriesTitle == normalizedTitle && s.UserId == userId);

        if (existing != null)
            return Result<ApiSeries>.Failure("A series with this title already exists", ErrorType.Conflict);

        var newSeries = new Series
        {
            SeriesTitle = normalizedTitle,
            SeriesTotal = apiSeries.SeriesTotal,
            UserId = userId
        };

        _db.Series.Add(newSeries);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            return Result<ApiSeries>.Failure("A series with this title already exists", ErrorType.Conflict);
        }

        return Result<ApiSeries>.Success(new ApiSeries
        {
            Id = newSeries.Id,
            SeriesTitle = newSeries.SeriesTitle,
            SeriesTotal = newSeries.SeriesTotal
        });
    }

    public async Task<Result> DeleteSeries(int seriesId, string userId)
    {
        var existing = await _db.Series
            .FirstOrDefaultAsync(s => s.Id == seriesId && s.UserId == userId);

        if (existing is null)
            return Result.Failure("Series not found", ErrorType.NotFound);

        var hasBooks = await _db.Books.AnyAsync(b => b.SeriesId == existing.Id);
        if (hasBooks)
            return Result.Failure("Cannot delete a series that has books associated with it", ErrorType.Conflict);

        _db.Series.Remove(existing);
        await _db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<List<ApiSeries>>> GetUserSeries(string userId)
    {
        var series = await _db.Series
            .Where(s => s.UserId == userId)
            .Select(s => new ApiSeries
            {
                Id = s.Id,
                SeriesTitle = s.SeriesTitle!,
                SeriesTotal = s.SeriesTotal
            })
            .ToListAsync();

        if (series.Count == 0)
            return Result<List<ApiSeries>>.Failure("No series found for user", ErrorType.NotFound);

        return Result<List<ApiSeries>>.Success(series);
    }
}