using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;
using Librestack.Models.APIModels;
using Microsoft.AspNetCore.Http.HttpResults;

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
        {

            var seriesBooks = await _db.Books.Where(b => b.SeriesId == existing.Id).ToListAsync();
            foreach (var book in seriesBooks)
            {
                book.SeriesId = null;
                book.SeriesOrder = null;
            }
        }
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
                SeriesTotal = s.SeriesTotal,
                BookCount = s.Books.Count
            }).OrderBy(l => l.SeriesTitle)
            .ToListAsync();

        if (series.Count == 0)
            return Result<List<ApiSeries>>.Failure("No series found for user", ErrorType.NotFound);

        return Result<List<ApiSeries>>.Success(series);
    }

    public async Task<Result<List<ApiSeries>>> GetSeriesByLibrary(int libraryId, string userId)
    {
        var series = await _db.Series.Where(s => s.UserId == userId &&
        s.Books.Any(b => b.Libraries.Any(l => l.Id == libraryId)))
        .Select(s => new ApiSeries
        {
            Id = s.Id,
            SeriesTitle = s.SeriesTitle!,
            SeriesTotal = s.SeriesTotal,
            BookCount = s.Books.Count(b => b.Libraries.Any(l => l.Id == libraryId))
        })
        .ToListAsync();

        if (series is null)
            return Result<List<ApiSeries>>.Failure("No series found for library", ErrorType.NotFound);

        return Result<List<ApiSeries>>.Success(series);
    }

    public async Task<Result> ReassignSeries(int bookId, string userId, int seriesId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrWhiteSpace(userId))
            return Result.Failure("User Id is required", ErrorType.BadRequest);

        var bookResponse = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);

        if (bookResponse is null) return Result.Failure("Book not found", ErrorType.NotFound);

        if (seriesId != 0)
        {
            var seriesResponse = await _db.Series.FirstOrDefaultAsync(s => s.Id == seriesId);
            if (seriesResponse is null) return Result.Failure("Series not found", ErrorType.NotFound);
        }
        if (seriesId == 0)
        {
            bookResponse.SeriesId = null;
        }
        else
        {
            bookResponse.SeriesId = seriesId;
        }

        _db.Books.Update(bookResponse);
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}