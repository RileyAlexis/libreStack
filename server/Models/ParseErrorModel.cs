using System.Text.Json.Serialization;

namespace Librestack.Models;

public class ParseErrorModel
{
    [JsonIgnore]
    public int Id { get; set; }
    [JsonIgnore]
    public string? UserId { get; set; }
    public int LibraryId { get; set; }
    public string? EpubPath { get; set; } = null;
    public string? ParseError { get; set; } = null;
}