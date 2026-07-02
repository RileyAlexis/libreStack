using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class Book
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    [JsonIgnore]
    public IdentityUser? User { get; set; }

    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public string Publisher { get; set; } = "";
    public string? Description { get; set; }
    public string? PublishDate { get; set; }
    public byte[]? CoverImage { get; set; } = null;
    public string? CoverContentType { get; set; } = null;
    public int? SeriesOrder { get; set; }
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
    public required string EpubPath { get; set; }
    public DateTime OpenLibraryMetadataLastUpdated { get; set; }
    public DateTime WikidataMetaLastUpdated { get; set; }

    [JsonIgnore]
    public ICollection<Library> Libraries { get; set; } = new List<Library>();
    public ICollection<BookTag> BookTags { get; set; } = new List<BookTag>();
    public ReadingProgress? ReadingProgress { get; set; }
    public ICollection<BookmarkModel> Bookmarks { get; set; } = new List<BookmarkModel>();

    public int? SeriesId { get; set; }
    public Series? Series { get; set; }
}
