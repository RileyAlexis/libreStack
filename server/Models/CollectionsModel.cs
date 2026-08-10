using System.Text.Json.Serialization;

namespace Librestack.Models;

public class Collections
{
    public int Id { get; set; }
    [JsonIgnore]
    public string? UserId { get; set; } = null;

    public string CollectionTitle { get; set; } = null!;
    public byte[]? CollectionCover { get; set; } = null;

    [JsonIgnore]
    public ICollection<Book> Books { get; set; } = new List<Book>();

}