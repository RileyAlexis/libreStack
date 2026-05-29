using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class Library
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public IdentityUser User { get; set; }

    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public string Publisher { get; set; } = "";
    public string? SeriesTitle { get; set; } = null;
    public int? SeriesOrder { get; set; }
    public int? SeriesTotal { get; set; }
    public string? ISBN { get; set; } = "";
    public string? LCCN { get; set; } = null;
    public string? OCLCWorldCat { get; set; } = null;
    public string? AmazonId { get; set; } = null;
    public string? WorkId { get; set; } = null;
    public int? CollectionId { get; set; }
    public required string EpubPath { get; set; }

    public ICollection<LibraryTag> LibraryTags { get; set; } = new List<LibraryTag>();
}
