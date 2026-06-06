using System.Text.Json.Serialization;

namespace Librestack.Models;

public class BookTag
{
    public int Id { get; set; }

    [JsonIgnore]
    public string? UserId { get; set; } = null;
    public string Tag { get; set; } = null!;

    [JsonIgnore]
    public ICollection<Book> Books { get; set; } = new List<Book>();
}