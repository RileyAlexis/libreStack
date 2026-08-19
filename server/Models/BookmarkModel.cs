using System.Text.Json.Serialization;

namespace Librestack.Models;

public class BookmarkModel
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public required string Name { get; set; }
    public required string CfiLocation { get; set; }

    [JsonIgnore]
    public string? UserId { get; set; } = null;
}
