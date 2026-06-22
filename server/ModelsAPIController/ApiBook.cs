using System.Text.Json.Serialization;

namespace Librestack.Models.APIModels;

public class ApiBook
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public string Publisher { get; set; } = "";
    public string? Description { get; set; }
    public string? PublishDate { get; set; }
    public byte[]? CoverImage { get; set; } = null;
    public string? CoverContentType { get; set; } = null;
    public string? SeriesTitle { get; set; } = null;
    public int? SeriesOrder { get; set; }
    public int? SeriesTotal { get; set; }
    public string? ISBN { get; set; } = "";
    public string? ISBN13 { get; set; } = "";
    public string? LCCN { get; set; } = null;
    public string? OCLCWorldCat { get; set; } = null;
    public string? OpenLibraryWorkId { get; set; } = null;
    public string? OpenLibraryEditionId { get; set; } = null;
    public string? OpenLibraryAuthorId { get; set; } = null;
    public string? OpenLibraryCoverId { get; set; } = null;
    public string? WikidataId { get; set; } = null;
    public string? Language { get; set; } = null;
    public int? CollectionId { get; set; }

    [JsonIgnore]
    public ICollection<BookTag> BookTags { get; set; } = new List<BookTag>();
    [JsonIgnore]
    public ICollection<ReadingProgress> ReadingProgress { get; set; } = new List<ReadingProgress>();

}
