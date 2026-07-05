namespace Librestack.Models;

public class BookSearchModel
{
    public int? BookId { get; set; }
    public int NumResults { get; set; }
    public string? Title { get; set; }
    public string? Author { get; set; } = "";
    public string? Publisher { get; set; } = "";
    public string? Description { get; set; }
    public string? SeriesName { get; set; }
    public int? SeriesOrder { get; set; }
    public string? Language { get; set; }
    public string? PublishDate { get; set; }
    public string? CoverId { get; set; }
    public byte[]? CoverImage { get; set; } = null;
    public string? ISBN { get; set; }
}