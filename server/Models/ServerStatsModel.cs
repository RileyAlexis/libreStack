namespace Librestack.Models;

public class LibraryStats
{
    public int LibraryId { get; set; }
    public string? LibraryName { get; set; }
    public int BookCount { get; set; }
    public double StorageSizeKb { get; set; }
    public int AuthorCount { get; set; }
    public int SeriesCount { get; set; }
    public int CollectionCount { get; set; }
    public int CompletedBookCount { get; set; }
    public string? LibraryPath { get; set; }
    public double DriveFreeSpace { get; set; }
}

public class ServerStats
{
    public List<LibraryStats>? LibraryStats { get; set; }
    public int TotalBooks { get; set; }
    public double TotalStorageSizeKB { get; set; }
    public int TotalAuthorCount { get; set; }
    public int TotalSeriesCount { get; set; }
    public int TotalCollectionCount { get; set; }
    public int TotalCompletedCount { get; set; }
    public int UsersCount { get; set; }
}