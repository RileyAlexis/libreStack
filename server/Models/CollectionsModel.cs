using System.Text.Json.Serialization;

namespace Librestack.Models;

public class CollectionsModel
{
    public int Id { get; set; }
    public string? UserId { get; set; } = null;
    public string CollectionTitle { get; set; } = null!;
    public byte[]? CollectionCover { get; set; } = null;

    [JsonIgnore]
    public ICollection<Book> Books { get; set; } = new List<Book>();

}