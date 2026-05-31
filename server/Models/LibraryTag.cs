using System.Text.Json.Serialization;

namespace Librestack.Models;

public class LibraryTag
{
    public int Id { get; set; }

    [JsonIgnore]
    public string? UserId { get; set; } = null;
    public string Tag { get; set; } = null!;

    [JsonIgnore]
    public ICollection<Library> Libraries { get; set; } = new List<Library>();
}