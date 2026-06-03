using System.Text.Json.Serialization;

namespace Librestack.Models.APIModels;

public class APILibrary
{
    public int Id { get; set; }
    public string? Title { get; set; } = "";
    public string? Author { get; set; } = "";
    public string? Publisher { get; set; } = "";
    public byte[]? CoverImage { get; set; } = null;
    public string? CoverContentType { get; set; } = null;
    public string? SeriesTitle { get; set; } = null;
    public int? SeriesOrder { get; set; }
    public int? SeriesTotal { get; set; }
    public string? ISBN { get; set; } = "";
    public string? LCCN { get; set; } = null;
    public string? OCLCWorldCat { get; set; } = null;
    public string? AmazonId { get; set; } = null;
    public string? WorkId { get; set; } = null;
    public int? CollectionId { get; set; }
    public string? EpubPath { get; set; } = null;

    [JsonIgnore]
    public ICollection<LibraryTag> LibraryTags { get; set; } = new List<LibraryTag>();
    [JsonIgnore]
    public ICollection<ReadingProgress> ReadingProgress { get; set; } = new List<ReadingProgress>();

}
