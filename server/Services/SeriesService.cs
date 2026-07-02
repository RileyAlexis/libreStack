using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class SeriesService : ISeriesService
{
    private readonly LibrestackDbContext _db;

    public SeriesService(LibrestackDbContext db)
    {
        _db = db;
    }

    public async Task<Series> ResolveOrCreateSeriesAsync(string normalizedTitle)
    {
        // Check entities already tracked in this context first — covers the
        // case where an earlier book in the same batch/save already added it
        var tracked = _db.ChangeTracker.Entries<Series>()
            .Select(e => e.Entity)
            .FirstOrDefault(s => s.SeriesTitle == normalizedTitle);
        if (tracked != null) return tracked;

        var existing = await _db.Series
            .FirstOrDefaultAsync(s => s.SeriesTitle == normalizedTitle);
        if (existing != null) return existing;

        var series = new Series { SeriesTitle = normalizedTitle };
        _db.Series.Add(series);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            // Lost the race to another request/thread — detach our copy and use theirs
            _db.Entry(series).State = EntityState.Detached;
            series = await _db.Series.FirstAsync(s => s.SeriesTitle == normalizedTitle);
        }

        return series;
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is Npgsql.PostgresException pg && pg.SqlState == "23505";
}