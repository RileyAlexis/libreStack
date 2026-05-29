using System.Text.Json.Serialization;

namespace Librestack.Models;

public class LibraryTags
{
    public int Id { get; set; }
    public string Tag { get; set; } = null!;

    [JsonIgnore]
    public ICollection<Library> Libraries { get; set; } = new List<Library>();
}